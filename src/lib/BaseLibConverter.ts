// Converts from Normal TS/JS Class to CursorScript Class

import Environment from "../runtime/environment";
import {
  MK_BOOL,
  MK_NATIVE_FN,
  MK_NULL,
  MK_NUMBER,
  MK_OBJECT,
  MK_STRING,
  type RuntimeValue,
  type FunctionValue,
} from "../runtime/values";

export default function ConvertTOMK_Object(obj: any) {
  const propertiesMap = new Map<string, RuntimeValue>();

  // 1. Convert Enumerable Properties (Constants)
  const keys = Object.keys(obj);
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "function") continue;

    // Convert all properties to CursorScript types
    propertiesMap.set(key, GetCursorXType(value)!);
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
          const rawArgs = args.map((arg) => {
            if ((arg as any).hasOwnProperty("value")) return (arg as any).value;

            // If it is a function, we must wrap it so native code can call it easily
            if (arg.type === "function") {
              const fn = arg as FunctionValue;
              return async (...nativeArgs: any[]) => {
                // Convert native args back to CursorX types
                const runtimeArgs = nativeArgs.map((a) => GetCursorXType(a)!);

                const scope = new Environment(fn.declarationEnv);
                for (let i = 0; i < fn.parameters.length; i++) {
                  scope.declareVar(
                    fn.parameters[i]!,
                    runtimeArgs[i] || MK_NULL(),
                    false,
                  );
                }

                let lastResult: RuntimeValue = MK_NULL();
                for (const stmt of fn.body) {
                  lastResult = await global.evaluate(stmt, scope);
                }

                return (lastResult as any).value !== undefined
                  ? (lastResult as any).value
                  : lastResult;
              };
            }

            return arg;
          });
          // Pad rawArgs with undefined up to the method's parameter count
          while (rawArgs.length < method.length) {
            rawArgs.push(undefined);
          }
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

export function GetCursorXType(value: any): RuntimeValue | null {
  if (value === null || typeof value === "undefined") {
    return MK_NULL();
  }

  // If it's already a CursorX RuntimeValue, don't convert it
  // Check for 'type' string property which is common across all our RuntimeValues
  if (typeof value === "object" && typeof (value as any).type === "string") {
    return value as RuntimeValue;
  }

  // Handle Promises
  if (value instanceof Promise) {
    return {
      type: "promise",
      promise: value.then((val) => GetCursorXType(val)!),
    } as any;
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
