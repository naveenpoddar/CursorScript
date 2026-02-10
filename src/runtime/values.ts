import type { Stmt } from "../frontend/ast";
import type Environment from "./environment";

export type ValueType =
  | "number"
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
