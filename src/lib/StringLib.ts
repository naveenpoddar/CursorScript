import ConvertTOMK_Object from "./BaseLibConverter";
import { toNative } from "./Utils";

class StringL {
  reverse(str: string) {
    return str.split("").reverse().join("");
  }

  split(str: string, separator: string) {
    return str.split(separator);
  }

  join(strs: string[], separator: string) {
    const strArray = toNative(strs) as string[];
    return strArray.join(separator ?? "");
  }

  length(str: string) {
    return str.length;
  }

  charAt(str: string, index: number) {
    return str.charAt(index);
  }

  charCodeAt(str: string, index: number) {
    return str.charCodeAt(index);
  }

  toLowerCase(str: string) {
    return str.toLowerCase();
  }

  toUpperCase(str: string) {
    return str.toUpperCase();
  }

  trim(str: string) {
    return str.trim();
  }

  trimStart(str: string) {
    return str.trimStart();
  }

  trimEnd(str: string) {
    return str.trimEnd();
  }

  startsWith(str: string, search: string) {
    return str.startsWith(search);
  }

  endsWith(str: string, search: string) {
    return str.endsWith(search);
  }

  contains(str: string, search: string) {
    return str.includes(search);
  }

  replace(str: string, search: string, replacement: string) {
    return str.replaceAll(search, replacement);
  }

  take(str: string, length: number) {
    return str.slice(0, length);
  }

  skip(str: string, length: number) {
    return str.slice(length);
  }

  substr(str: string, start: number, length: number) {
    return str.slice(start, start + length);
  }
}

export const StringLib = ConvertTOMK_Object(new StringL());
