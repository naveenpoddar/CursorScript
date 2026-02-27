import type {
  FunctionDeclaration,
  IfStmt,
  WhileStmt,
  Program,
  VarDeclaration,
  ImportDeclaration,
  ExportDeclaration,
  ReturnStmt,
} from "../../frontend/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import { unwrapAwait } from "../../lib/Utils";
import {
  MK_NULL,
  type BooleanValue,
  type FunctionValue,
  type NumberValue,
  type RuntimeValue,
  MK_ARRAY,
  type ArrayValue,
  type AwaitResultValue,
} from "../values";

function isTruthy(val: RuntimeValue): boolean {
  const unwrapped = unwrapAwait(val);
  if (unwrapped.type === "boolean") return (unwrapped as BooleanValue).value;
  if (unwrapped.type === "number")
    return (unwrapped as NumberValue).value !== 0;
  if (unwrapped.type === "null") return false;
  return true;
}

export class ReturnSignal {
  constructor(public value: RuntimeValue) {}
}

export async function evaluateIfStmt(
  stmt: IfStmt,
  env: Environment,
): Promise<RuntimeValue> {
  const condition = await evaluate(stmt.condition, env);

  if (isTruthy(condition)) {
    const scope = new Environment(env);
    let lastEvaluatedValue: RuntimeValue = MK_NULL();
    for (const child of stmt.thenBranch) {
      lastEvaluatedValue = await evaluate(child, scope);
    }
    return lastEvaluatedValue;
  } else if (stmt.elseBranch) {
    const scope = new Environment(env);
    let lastEvaluatedValue: RuntimeValue = MK_NULL();
    for (const child of stmt.elseBranch) {
      lastEvaluatedValue = await evaluate(child, scope);
    }
    return lastEvaluatedValue;
  }

  return MK_NULL();
}

export async function evaluateWhileStmt(
  stmt: WhileStmt,
  env: Environment,
): Promise<RuntimeValue> {
  let lastEvaluatedValue: RuntimeValue = MK_NULL();

  while (isTruthy(await evaluate(stmt.condition, env))) {
    const scope = new Environment(env);
    for (const child of stmt.body) {
      lastEvaluatedValue = await evaluate(child, scope);
    }
  }

  return lastEvaluatedValue;
}

export async function evaluateProgram(
  program: Program,
  env: Environment,
): Promise<RuntimeValue> {
  let lastEvaluatedValue: RuntimeValue = MK_NULL();

  for (const child of program.body) {
    lastEvaluatedValue = await evaluate(child, env);
  }

  // Ensure all background tasks are promised
  // We use a loop because async tasks might spawn more async tasks
  while (
    (global as any).pendingPromises &&
    (global as any).pendingPromises.length > 0
  ) {
    const toWait = [...(global as any).pendingPromises];
    (global as any).pendingPromises = [];
    await Promise.all(toWait);
  }

  return lastEvaluatedValue;
}

export async function evaluateVarDeclaration(
  varDecl: VarDeclaration,
  env: Environment,
): Promise<RuntimeValue> {
  let value = varDecl.value ? await evaluate(varDecl.value, env) : MK_NULL();

  // Special handling for AwaitResult
  if (value.type === "await-result") {
    const awaitRes = value as AwaitResultValue;
    if (varDecl.identifiers) {
      // Destructuring: let (r, e) = await ...
      value = MK_ARRAY([awaitRes.result, awaitRes.error]);
    } else {
      // Single var: let r = await ...
      if (awaitRes.error.type !== "null") {
        throw (awaitRes.error as any).value;
      }
      value = awaitRes.result;
    }
  }

  if (varDecl.identifiers) {
    // Destructuring (a, b) = value
    if (value.type !== "array") {
      throw `Cannot destructure non-array value. Got ${value.type}`;
    }
    const arr = value as ArrayValue;
    for (let i = 0; i < varDecl.identifiers.length; i++) {
      env.declareVar(
        varDecl.identifiers[i]!,
        arr.elements[i] || MK_NULL(),
        varDecl.constant,
      );
    }
    return value;
  }

  return env.declareVar(varDecl.identifier, value, varDecl.constant);
}

export function evaluateFunctionDeclaration(
  fnDecl: FunctionDeclaration,
  env: Environment,
): RuntimeValue {
  const fn = {
    type: "function",
    name: fnDecl.name,
    parameters: fnDecl.parameters,
    body: fnDecl.body,
    async: fnDecl.async,
    declarationEnv: env,
  } as FunctionValue;

  return env.declareVar(fnDecl.name, fn, true);
}

export async function evaluateImportDeclaration(
  stmt: ImportDeclaration,
  env: Environment,
): Promise<RuntimeValue> {
  const exports = await global.loadModule(stmt.source);

  for (const name of stmt.specifiers) {
    if (!exports.has(name)) {
      throw `Module "${stmt.source}" does not export "${name}".`;
    }
    env.declareVar(name, exports.get(name)! as RuntimeValue, true);
  }

  return MK_NULL();
}

export async function evaluateExportDeclaration(
  stmt: ExportDeclaration,
  env: Environment,
): Promise<RuntimeValue> {
  const decl = stmt.declaration;
  let name = "";

  if (decl.kind === "VarDeclaration") {
    const varDecl = decl as VarDeclaration;
    name = varDecl.identifier;
    await evaluateVarDeclaration(varDecl, env);
  } else if (decl.kind === "FunctionDeclaration") {
    const fnDecl = decl as FunctionDeclaration;
    name = fnDecl.name;
    evaluateFunctionDeclaration(fnDecl, env);
  }

  env.exports.add(name);
  return MK_NULL();
}

export async function evaluateReturnStmt(
  stmt: ReturnStmt,
  env: Environment,
): Promise<RuntimeValue> {
  const value = stmt.value ? await evaluate(stmt.value, env) : MK_NULL();
  throw new ReturnSignal(value);
}
