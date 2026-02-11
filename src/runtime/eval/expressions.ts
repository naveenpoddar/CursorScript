import type {
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  Identifier,
  MemberExpr,
  ObjectLiteral,
} from "../../frontend/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import {
  MK_NULL,
  type FunctionValue,
  type NativeFnValue,
  type NumberValue,
  type ObjectValue,
  type RuntimeValue,
  type StringValue,
} from "../values";

function eval_numeric_binary_expr(
  operator: string,
  LHS: NumberValue,
  RHS: NumberValue,
): RuntimeValue {
  let result = 0;

  switch (operator) {
    case "+":
      result = LHS.value + RHS.value;
      break;
    case "-":
      result = LHS.value - RHS.value;
      break;
    case "*":
      result = LHS.value * RHS.value;
      break;
    case "/":
      result = LHS.value / RHS.value;
      break;
    case "%":
      result = LHS.value % RHS.value;
      break;
    default:
      console.error("This operator has not yet been setup for interpretation");
      process.exit(0);
  }

  return {
    type: "number",
    value: result,
  } as NumberValue;
}

export function evaluateBinaryExpr(
  binop: BinaryExpr,
  env: Environment,
): RuntimeValue {
  const LHS = evaluate(binop.left, env);
  const RHS = evaluate(binop.right, env);

  if (LHS.type == "number" && RHS.type == "number") {
    return eval_numeric_binary_expr(
      binop.operator,
      LHS as NumberValue,
      RHS as NumberValue,
    );
  }

  return MK_NULL();
}

export function evaluateIdentifier(
  ident: Identifier,
  env: Environment,
): RuntimeValue {
  return env.lookupVar(ident.symbol);
}

export function evaluateMemberExpr(
  member: MemberExpr,
  env: Environment,
): RuntimeValue {
  const object = evaluate(member.object, env) as ObjectValue;

  if (typeof object === "undefined")
    throw `"${(member.object as Identifier).symbol}" is not defined.`;

  if (object.type !== "object") return MK_NULL();

  const property = member.computed
    ? evaluate(member.property, env)
    : ({
        type: "string",
        value: (member.property as Identifier).symbol,
      } as any);

  return object.properties.get((property as any).value) || MK_NULL();
}

export function evalObjectExpr(
  obj: ObjectLiteral,
  env: Environment,
): RuntimeValue {
  const object: ObjectValue = {
    type: "object",
    properties: new Map<string, RuntimeValue>(),
  };

  for (const { key, value } of obj.properties) {
    const runtimeValue =
      value == null ? env.lookupVar(key) : evaluate(value, env);

    object.properties.set(key, runtimeValue);
  }

  return object;
}

export function evalCallExpr(expr: CallExpr, env: Environment): RuntimeValue {
  const args = expr.args.map((arg) => evaluate(arg, env));

  const caller = evaluate(expr.caller, env);

  if (caller.type === "native-fn") {
    return (caller as NativeFnValue).call(args, env);
  }

  if (caller.type === "function") {
    const func = caller as FunctionValue;
    const scope = new Environment(func.declarationEnv);

    // Create the variables for the parameters
    for (let i = 0; i < func.parameters.length; i++) {
      const varname = func.parameters[i]!;

      scope.declareVar(varname, args[i]!, false);
    }

    let results: RuntimeValue = MK_NULL();
    for (const stmt of func.body) {
      results = evaluate(stmt, scope);
    }

    return results;
  }

  throw `Cannot call value that is not a function: ${JSON.stringify(caller)}`;
}

export function evaluateAssignment(
  node: AssignmentExpr,
  env: Environment,
): RuntimeValue {
  if (node.assignee.kind !== "Identifier") {
    throw `Invalid LHS inside assignment expression ${JSON.stringify(node.assignee)}`;
  }

  const varname = (node.assignee as Identifier).symbol;
  return env.assignVar(varname, evaluate(node.value, env));
}
