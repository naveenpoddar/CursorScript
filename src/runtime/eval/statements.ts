import type {
  FunctionDeclaration,
  IfStmt,
  Program,
  VarDeclaration,
} from "../../frontend/ast";
import type Environment from "../environment";
import { evaluate } from "../interpreter";
import {
  MK_NULL,
  type BooleanValue,
  type FunctionValue,
  type RuntimeValue,
} from "../values";

export function evaluateIfStmt(stmt: IfStmt, env: Environment): RuntimeValue {
  const condition = evaluate(stmt.condition, env);

  // Truthy check
  let isTruthy = false;
  if (condition.type === "boolean")
    isTruthy = (condition as BooleanValue).value;
  else if (condition.type === "number")
    isTruthy = (condition as any).value !== 0;
  else if (condition.type !== "null") isTruthy = true;

  if (isTruthy) {
    let lastEvaluatedValue: RuntimeValue = MK_NULL();
    for (const child of stmt.thenBranch) {
      lastEvaluatedValue = evaluate(child, env);
    }
    return lastEvaluatedValue;
  } else if (stmt.elseBranch) {
    let lastEvaluatedValue: RuntimeValue = MK_NULL();
    for (const child of stmt.elseBranch) {
      lastEvaluatedValue = evaluate(child, env);
    }
    return lastEvaluatedValue;
  }

  return MK_NULL();
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
