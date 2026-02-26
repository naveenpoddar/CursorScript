import ConvertTOMK_Object from "./BaseLibConverter";
import { toNative } from "./Utils";

class JsonL {
  deserialize(jsonString: string) {
    return JSON.parse(jsonString);
  }

  serialize(value: any) {
    const nativeValue = toNative(value);
    return JSON.stringify(nativeValue, null, 2);
  }
}

export const JsonLib = ConvertTOMK_Object(new JsonL());
