import type {
  FunctionDeclaration,
  IfStmt,
  WhileStmt,
  Program,
  VarDeclaration,
  ImportDeclaration,
  ExportDeclaration,
} from "../../frontend/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import {
  MK_NULL,
  type BooleanValue,
  type FunctionValue,
  type NumberValue,
  type RuntimeValue,
} from "../values";

function isTruthy(val: RuntimeValue): boolean {
  if (val.type === "boolean") return (val as BooleanValue).value;
  if (val.type === "number") return (val as NumberValue).value !== 0;
  if (val.type === "null") return false;
  return true;
}

export function evaluateIfStmt(stmt: IfStmt, env: Environment): RuntimeValue {
  const condition = evaluate(stmt.condition, env);

  if (isTruthy(condition)) {
    const scope = new Environment(env);
    let lastEvaluatedValue: RuntimeValue = MK_NULL();
    for (const child of stmt.thenBranch) {
      lastEvaluatedValue = evaluate(child, scope);
    }
    return lastEvaluatedValue;
  } else if (stmt.elseBranch) {
    const scope = new Environment(env);
    let lastEvaluatedValue: RuntimeValue = MK_NULL();
    for (const child of stmt.elseBranch) {
      lastEvaluatedValue = evaluate(child, scope);
    }
    return lastEvaluatedValue;
  }

  return MK_NULL();
}

export function evaluateWhileStmt(
  stmt: WhileStmt,
  env: Environment,
): RuntimeValue {
  let lastEvaluatedValue: RuntimeValue = MK_NULL();

  while (isTruthy(evaluate(stmt.condition, env))) {
    const scope = new Environment(env);
    for (const child of stmt.body) {
      lastEvaluatedValue = evaluate(child, scope);
    }
  }

  return lastEvaluatedValue;
}

export function evaluateProgram(
  program: Program,
  env: Environment,
): RuntimeValue {
  let lastEvaluatedValue: RuntimeValue = MK_NULL();

  for (const child of program.body) {
    lastEvaluatedValue = evaluate(child, env);
  }

  return lastEvaluatedValue;
}

export function evaluateVarDeclaration(
  varDecl: VarDeclaration,
  env: Environment,
): RuntimeValue {
  const value = varDecl.value ? evaluate(varDecl.value, env) : MK_NULL();
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
    declarationEnv: env,
  } as FunctionValue;

  return env.declareVar(fnDecl.name, fn, true);
}

export function evaluateImportDeclaration(
  stmt: ImportDeclaration,
  env: Environment,
): RuntimeValue {
  const exports = global.loadModule(stmt.source);

  for (const name of stmt.specifiers) {
    if (!exports.has(name)) {
      throw `Module "${stmt.source}" does not export "${name}".`;
    }
    env.declareVar(name, exports.get(name)! as RuntimeValue, true);
  }

  return MK_NULL();
}

export function evaluateExportDeclaration(
  stmt: ExportDeclaration,
  env: Environment,
): RuntimeValue {
  const decl = stmt.declaration;
  let name = "";

  if (decl.kind === "VarDeclaration") {
    const varDecl = decl as VarDeclaration;
    name = varDecl.identifier;
    evaluateVarDeclaration(varDecl, env);
  } else if (decl.kind === "FunctionDeclaration") {
    const fnDecl = decl as FunctionDeclaration;
    name = fnDecl.name;
    evaluateFunctionDeclaration(fnDecl, env);
  }

  env.exports.add(name);
  return MK_NULL();
}
