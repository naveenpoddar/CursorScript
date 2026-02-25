import {
  MK_BOOL,
  MK_NULL,
  MK_NUMBER,
  MK_STRING,
  MK_ARRAY,
  MK_OBJECT,
  type RuntimeValue,
} from "./values";

export function serializeRuntimeValue(value: any): any {
  if (value === null || typeof value === "undefined") return null;

  // Handle RuntimeValue types
  if (typeof value === "object" && typeof value.type === "string") {
    switch (value.type) {
      case "number":
      case "string":
      case "boolean":
        return value.value;
      case "null":
        return null;
      case "array":
        return (value as any).elements.map(serializeRuntimeValue);
      case "object":
        const obj = value as any;
        const result: Record<string, any> = {};
        for (const [key, val] of obj.properties) {
          result[key] = serializeRuntimeValue(val);
        }
        return result;
      case "function":
      case "native-fn":
        return "__FUNCTION__";
      default:
        return null;
    }
  }

  // Handle native types (if they were already unwrapped)
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(serializeRuntimeValue);
  }

  if (typeof value === "object") {
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = serializeRuntimeValue(val);
    }
    return result;
  }

  return null;
}

export function deserializeToRuntimeValue(value: any): RuntimeValue {
  if (value === null || typeof value === "undefined") {
    return MK_NULL();
  }

  if (Array.isArray(value)) {
    return MK_ARRAY(value.map(deserializeToRuntimeValue));
  }

  switch (typeof value) {
    case "number":
      return MK_NUMBER(value);
    case "string":
      return MK_STRING(value);
    case "boolean":
      return MK_BOOL(value);
    case "object":
      const properties = new Map<string, RuntimeValue>();
      for (const [key, val] of Object.entries(value)) {
        properties.set(key, deserializeToRuntimeValue(val));
      }
      return MK_OBJECT(properties);
    default:
      return MK_NULL();
  }
}
