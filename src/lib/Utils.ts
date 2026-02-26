import Environment from "../runtime/environment";
import { evaluate } from "../runtime/interpreter";
import { MK_NULL, type RuntimeValue } from "../runtime/values";
import { GetCursorXType } from "./BaseLibConverter";

export function executeCallback(func: any, ...args: any[]) {
  if (typeof func === "function") {
    // If it's a wrapped function from BaseLibConverter, just call it
    return func(...args);
  } else if (func && func.body) {
    // If it's a raw FunctionValue (internal call), evaluate it
    const runtimeArgs = args.map((a) => GetCursorXType(a)!);

    const scope = new Environment(func.declarationEnv);

    // Declare the passed arguments in the local scope
    if (func.parameters) {
      for (let i = 0; i < func.parameters.length; i++) {
        scope.declareVar(
          func.parameters[i]!,
          runtimeArgs[i] || MK_NULL(),
          false,
        );
      }
    }

    let lastResult: RuntimeValue = MK_NULL();
    for (const stmt of func.body) {
      lastResult = evaluate(stmt, scope) as RuntimeValue;
    }

    return (lastResult as any).value !== undefined
      ? (lastResult as any).value
      : lastResult;
  }
}

export function toNative(val: any): any {
  if (val === null || val === undefined) return null;

  // Handle primitives that have been extracted by BaseLibConverter
  if (
    typeof val === "string" ||
    typeof val === "number" ||
    typeof val === "boolean" ||
    typeof val === "function"
  ) {
    return val;
  }

  // Handle RuntimeValues
  if (
    val.type === "number" ||
    val.type === "string" ||
    val.type === "boolean"
  ) {
    return val.value;
  }

  if (val.type === "null") {
    return null;
  }

  if (val.type === "array") {
    return val.elements.map((el: any) => toNative(el));
  }

  if (val.type === "object") {
    const obj: any = {};
    for (const [key, value] of val.properties) {
      obj[key] = toNative(value);
    }
    return obj;
  }

  return val;
}
