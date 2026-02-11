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

  // 1. Convert Enumerable Properties (Constants)
  const keys = Object.keys(obj);
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "function") continue;

    // Only convert simple types for properties to avoid recursion into native objects
    if (
      typeof value === "number" ||
      typeof value === "string" ||
      typeof value === "boolean" ||
      value == null
    ) {
      propertiesMap.set(key, GetCursorXType(value)!);
    }
  }

  const proto = Object.getPrototypeOf(obj);
  if (proto && proto !== Object.prototype) {
    const methodNames = Object.getOwnPropertyNames(proto);

    for (const name of methodNames) {
      if (name === "constructor" || propertiesMap.has(name)) continue;

      const method = obj[name] as Function;
      // We create a wrapper function that intercepts the execution
      const interceptor = (args: RuntimeValue[], env: Environment) => {
        try {
          // 1. Map arguments and execute the native method
          // We provide the raw parameters and environment as well for advanced libs
          const rawArgs = args.map((arg) =>
            (arg as any).hasOwnProperty("value") ? (arg as any).value : arg,
          );
          const result = method.apply(obj, [...rawArgs, args, env]);

          // 2. Convert result to CursorScript type
          const runtimeResult = GetCursorXType(result);

          if (runtimeResult === null) {
            throw `Method "${name}" returned an incompatible type: ${typeof result}`;
          }

          return runtimeResult;
        } catch (error: any) {
          // 3. Intercept the failure
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
  if (value === null || typeof value === "undefined") {
    return MK_NULL();
  }

  // If it's already a CursorX RuntimeValue, don't convert it
  // Check for 'type' string property which is common across all our RuntimeValues
  if (typeof value === "object" && typeof (value as any).type === "string") {
    return value as RuntimeValue;
  }

  if (Array.isArray(value)) {
    return {
      type: "array",
      elements: value.map((v) => GetCursorXType(v)!),
    } as any;
  }

  switch (typeof value) {
    case "number":
      return MK_NUMBER(value);
    case "string":
      return MK_STRING(value);
    case "boolean":
      return MK_BOOL(value);
    case "object":
      return ConvertTOMK_Object(value);
    case "function":
      return MK_NATIVE_FN(value);
    default:
      return null;
  }
}
