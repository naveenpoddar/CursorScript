export function requireNumber(n: any): number {
  if (typeof n !== "number") {
    throw new Error(`Expected a number but got ${typeof n}`);
  }
  return n;
}

export function requireNumbers(n: any[]): number[] {
  return n.map(requireNumber);
}

export function requireString(n: any): string {
  if (typeof n !== "string") {
    throw new Error(`Expected a string but got ${typeof n}`);
  }
  return n;
}

export function requireStrings(n: any[]): string[] {
  return n.map(requireString);
}

export function requireBoolean(n: any): boolean {
  if (typeof n !== "boolean") {
    throw new Error(`Expected a boolean but got ${typeof n}`);
  }
  return n;
}

export function requireBooleans(n: any[]): boolean[] {
  return n.map(requireBoolean);
}
