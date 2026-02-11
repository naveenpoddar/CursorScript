// Converts from Normal TS/JS Class to CursorScript Class

import type Environment from "../runtime/environment";
import {
  MK_BOOL,
  MK_NATIVE_FN,
  MK_NULL,
  MK_NUMBER,
  MK_OBJECT,
  MK_STRING,
  type RuntimeValue,
} from "../runtime/values";

export default function ConvertTOMK_Object(obj: any) {
  const propertiesMap = new Map<string, RuntimeValue>();

  const props = Object.entries(obj);

  for (const [key, value] of props) {
    let runtimeValue: RuntimeValue | null = GetCursorXType(value);

    if (!runtimeValue)
      throw `${key}: ${value} did not find its right CursorScript Type.`;

    propertiesMap.set(key, runtimeValue);
  }

  const proto = Object.getPrototypeOf(obj);
  if (proto && proto !== Object.prototype) {
    const methodNames = Object.getOwnPropertyNames(proto);

    for (const name of methodNames) {
      if (name === "constructor" || propertiesMap.has(name)) continue;

      const method = obj[name] as Function;
      // We create a wrapper function that intercepts the execution
      const interceptor = (args: RuntimeValue[], _: Environment) => {
        try {
          // 1. Map arguments and execute the native method
          // We wrap 'apply' to catch any logic errors inside the TS class
          const rawArgs = args.map((arg) => (arg as any).value);
          const result = method.apply(obj, rawArgs);

          // 2. Convert result to CursorScript type
          const runtimeResult = GetCursorXType(result);

          if (runtimeResult === null) {
            throw `Method "${name}" returned an incompatible type: ${typeof result}`;
          }

          return runtimeResult;
        } catch (error: any) {
          // 3. Intercept the failure
          // You can customize this to provide better debugging info
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          throw `Runtime Error in native method "${name}": ${errorMessage}`;
        }
      };

      propertiesMap.set(name, MK_NATIVE_FN(interceptor));
    }
  }

  return MK_OBJECT(propertiesMap);
}

function GetCursorXType(value: any): RuntimeValue | null {
  switch (typeof value) {
    case "number":
      return MK_NUMBER(value);

    case "string":
      return MK_STRING(value);

    case "object":
      return ConvertTOMK_Object(value);

    case "boolean":
      return MK_BOOL(value);

    case "undefined":
      return MK_NULL();

    case "function":
      const fn = value as Function;
      return MK_NATIVE_FN(fn.call);

    default:
      return null;
  }
}
