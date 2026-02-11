import type { Stmt } from "../frontend/ast";
import type Environment from "./environment";

export function MakePrintable(
  value: RuntimeValue,
): string | number | boolean | Map<string, any> {
  if (value.type === "number") {
    return (value as NumberValue).value;
  }
  if (value.type === "null") {
    return "null";
  }
  if (value.type === "boolean") {
    return (value as BooleanValue).value;
  }
  if (value.type === "object") {
    const transformed = new Map<string, any>();
    const obj = value as ObjectValue;

    for (const [key, value] of obj.properties) {
      transformed.set(key, MakePrintable(value));
    }

    return transformed;
  }
  if (value.type === "native-fn") {
    // Make pretty Print e.g: fn add(x, y)
    const fn = value as NativeFnValue;
    return `fn nativeFn(...)`;
  }
  if (value.type === "function") {
    // Make pretty Print e.g: fn add(x, y) { ... }
    const fn = value as FunctionValue;
    return `fn ${fn.name}(${fn.parameters.join(", ")}) { ... }`;
  }

  return String((value as any).value).toString();
}

export type ValueType =
  | "number"
  | "string"
  | "null"
  | "boolean"
  | "object"
  | "native-fn"
  | "function";

export interface RuntimeValue {
  type: ValueType;
}

export interface NumberValue extends RuntimeValue {
  type: "number";
  value: number;
}

export interface StringValue extends RuntimeValue {
  type: "string";
  value: string;
}

export interface NullValue extends RuntimeValue {
  type: "null";
  value: null;
}

export interface BooleanValue extends RuntimeValue {
  type: "boolean";
  value: boolean;
}

export interface ObjectValue extends RuntimeValue {
  type: "object";
  properties: Map<string, RuntimeValue>;
}

export function MK_NUMBER(n = 0): NumberValue {
  return {
    type: "number",
    value: n,
  } as NumberValue;
}

export function MK_STRING(s = ""): StringValue {
  return {
    type: "string",
    value: s,
  } as StringValue;
}

export function MK_NULL(): NullValue {
  return {
    type: "null",
    value: null,
  } as NullValue;
}

export function MK_BOOL(b = true): BooleanValue {
  return {
    type: "boolean",
    value: b,
  } as BooleanValue;
}

export type FunctionCall = (
  args: RuntimeValue[],
  env: Environment,
) => RuntimeValue;

export interface NativeFnValue extends RuntimeValue {
  type: "native-fn";
  call: FunctionCall;
}

export function MK_NATIVE_FN(call: FunctionCall): NativeFnValue {
  return {
    type: "native-fn",
    call,
  } as NativeFnValue;
}

export interface FunctionValue extends RuntimeValue {
  type: "function";
  name: string;
  parameters: string[];
  declarationEnv: Environment;
  body: Stmt[];
}
