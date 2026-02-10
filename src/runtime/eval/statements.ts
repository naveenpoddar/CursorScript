import type {
  FunctionDeclaration,
  Program,
  VarDeclaration,
} from "../../frontend/ast";
import type Environment from "../environment";
import { evaluate } from "../interpreter";
import { MK_NULL, type FunctionValue, type RuntimeValue } from "../values";

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
