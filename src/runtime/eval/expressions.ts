import type {
  ArrayLiteral,
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  Identifier,
  MemberExpr,
  ObjectLiteral,
  UnaryExpr,
} from "../../frontend/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import {
  MK_ARRAY,
  MK_NULL,
  MK_NUMBER,
  type ArrayValue,
  type BooleanValue,
  type FunctionValue,
  type NativeFnValue,
  type NumberValue,
  type ObjectValue,
  type RuntimeValue,
  type StringValue,
} from "../values";

function isTruthy(val: RuntimeValue): boolean {
  if (val.type === "boolean") return (val as BooleanValue).value;
  if (val.type === "number") return (val as NumberValue).value !== 0;
  if (val.type === "null") return false;
  return true;
}

export function evaluateUnaryExpr(
  unary: UnaryExpr,
  env: Environment,
): RuntimeValue {
  const arg = evaluate(unary.argument, env);

  if (unary.operator === "!") {
    return { type: "boolean", value: !isTruthy(arg) } as any;
  }

  if (unary.operator === "-") {
    if (arg.type !== "number")
      throw "Cannot apply '-' operator to non-number type.";
    return MK_NUMBER(-(arg as NumberValue).value);
  }

  return MK_NULL();
}

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

  // Short-circuiting for logical operators
  if (binop.operator === "&&") {
    if (!isTruthy(LHS)) return LHS;
    return evaluate(binop.right, env);
  }
  if (binop.operator === "||") {
    if (isTruthy(LHS)) return LHS;
    return evaluate(binop.right, env);
  }

  const RHS = evaluate(binop.right, env);

  // 1. Numeric Binary Expressions
  if (LHS.type == "number" && RHS.type == "number") {
    const l = LHS as NumberValue;
    const r = RHS as NumberValue;

    if (binop.operator === "==")
      return { type: "boolean", value: l.value === r.value } as any;
    if (binop.operator === "!=")
      return { type: "boolean", value: l.value !== r.value } as any;
    if (binop.operator === "<")
      return { type: "boolean", value: l.value < r.value } as any;
    if (binop.operator === ">")
      return { type: "boolean", value: l.value > r.value } as any;
    if (binop.operator === "<=")
      return { type: "boolean", value: l.value <= r.value } as any;
    if (binop.operator === ">=")
      return { type: "boolean", value: l.value >= r.value } as any;

    return eval_numeric_binary_expr(binop.operator, l, r);
  }

  // 2. Equality check for non-numbers (Booleans, Strings, Null)
  if (binop.operator === "==") {
    return {
      type: "boolean",
      value: (LHS as any).value === (RHS as any).value,
    } as any;
  }
  if (binop.operator === "!=") {
    return {
      type: "boolean",
      value: (LHS as any).value !== (RHS as any).value,
    } as any;
  }

  // 3. String Concatenation
  if (
    binop.operator === "+" &&
    (LHS.type === "string" || RHS.type === "string")
  ) {
    const lValue =
      LHS.type === "string" ? (LHS as StringValue).value : (LHS as any).value;
    const rValue =
      RHS.type === "string" ? (RHS as StringValue).value : (RHS as any).value;
    return {
      type: "string",
      value: String(lValue) + String(rValue),
    } as StringValue;
  }

  return MK_NULL();
}

export function evaluateIdentifier(
  ident: Identifier,
  env: Environment,
): RuntimeValue {
  return env.lookupVar(ident.symbol);
}

export function evaluateArrayLiteral(
  arr: ArrayLiteral,
  env: Environment,
): RuntimeValue {
  const elements = arr.elements.map((el) => evaluate(el, env));
  return MK_ARRAY(elements);
}

export function evaluateMemberExpr(
  member: MemberExpr,
  env: Environment,
): RuntimeValue {
  const object = evaluate(member.object, env);

  if (object.type === "object") {
    const obj = object as ObjectValue;
    const property = member.computed
      ? evaluate(member.property, env)
      : ({
          type: "string",
          value: (member.property as Identifier).symbol,
        } as any);

    return obj.properties.get((property as any).value) || MK_NULL();
  }

  if (object.type === "array") {
    const arr = object as ArrayValue;
    if (!member.computed) {
      // Support .length for arrays?
      const prop = (member.property as Identifier).symbol;
      if (prop === "length") return MK_NUMBER(arr.elements.length);
      throw `Array does not have property: ${prop}`;
    }

    const index = evaluate(member.property, env);
    if (index.type !== "number") {
      throw `Array index must be a number, got ${index.type}`;
    }

    const i = (index as NumberValue).value;
    return arr.elements[i] || MK_NULL();
  }

  throw `Cannot use member expression on type: ${object.type}`;
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

export function evaluateCallExpr(
  expr: CallExpr,
  env: Environment,
): RuntimeValue {
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
  if (node.assignee.kind === "Identifier") {
    const varname = (node.assignee as Identifier).symbol;
    return env.assignVar(varname, evaluate(node.value, env));
  }

  if (node.assignee.kind === "MemberExpr") {
    const member = node.assignee as MemberExpr;
    const object = evaluate(member.object, env);

    if (object.type === "object") {
      const obj = object as ObjectValue;
      const property = member.computed
        ? evaluate(member.property, env)
        : ({
            type: "string",
            value: (member.property as Identifier).symbol,
          } as any);

      const val = evaluate(node.value, env);
      obj.properties.set((property as any).value, val);
      return val;
    }

    if (object.type === "array") {
      const arr = object as ArrayValue;
      if (!member.computed) {
        throw "Cannot assign to a non-computed property of an array.";
      }

      const index = evaluate(member.property, env);
      if (index.type !== "number") {
        throw `Array index must be a number, got ${index.type}`;
      }

      const val = evaluate(node.value, env);
      arr.elements[(index as NumberValue).value] = val;
      return val;
    }

    throw `Cannot assign to a property of type: ${object.type}`;
  }

  throw `Invalid LHS inside assignment expression: ${JSON.stringify(node.assignee)}`;
}
