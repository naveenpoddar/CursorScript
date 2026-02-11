import ConvertTOMK_Object from "./BaseLibConverter";
import { requireNumber, requireNumbers } from "./RequireFunctions";

export * from "./RequireFunctions";

class _MathL {
  // --- Constants ---
  public readonly PI = Math.PI;
  public readonly E = Math.E;
  public readonly TAU = Math.PI * 2;
  public readonly PHI = 1.618033988749895; // Golden Ratio
  public readonly SQRT2 = Math.SQRT2;

  // --- Basic Functions ---
  public abs(n: any) {
    n = requireNumber(n);
    return Math.abs(n);
  }
  public sign(n: any) {
    n = requireNumber(n);
    return Math.sign(n);
  }
  public round(n: any) {
    n = requireNumber(n);
    return Math.round(n);
  }
  public floor(n: any) {
    n = requireNumber(n);
    return Math.floor(n);
  }
  public ceil(n: any) {
    n = requireNumber(n);
    return Math.ceil(n);
  }
  public trunc(n: any) {
    n = requireNumber(n);
    return Math.trunc(n);
  }

  // --- Power & Roots ---
  public pow(base: any, exp: any) {
    base = requireNumber(base);
    exp = requireNumber(exp);
    return Math.pow(base, exp);
  }
  public sqrt(n: any) {
    n = requireNumber(n);
    return Math.sqrt(n);
  }
  public cbrt(n: any) {
    n = requireNumber(n);
    return Math.cbrt(n);
  }
  public root(n: any, r: any) {
    n = requireNumber(n);
    r = requireNumber(r);
    return Math.pow(n, 1 / r);
  }

  // --- Trigonometry (Radians) ---
  public sin(n: any) {
    n = requireNumber(n);
    return Math.sin(n);
  }
  public cos(n: any) {
    n = requireNumber(n);
    return Math.cos(n);
  }
  public tan(n: any) {
    n = requireNumber(n);
    return Math.tan(n);
  }
  public asin(n: any) {
    n = requireNumber(n);
    return Math.asin(n);
  }
  public acos(n: any) {
    n = requireNumber(n);
    return Math.acos(n);
  }
  public atan(n: any) {
    n = requireNumber(n);
    return Math.atan(n);
  }
  public atan2(y: any, x: any) {
    y = requireNumber(y);
    x = requireNumber(x);
    return Math.atan2(y, x);
  }

  // --- Trigonometry (Degrees) ---
  public sinDeg(deg: any) {
    deg = requireNumber(deg);
    return Math.sin(deg * (this.PI / 180));
  }
  public cosDeg(deg: any) {
    deg = requireNumber(deg);
    return Math.cos(deg * (this.PI / 180));
  }
  public tanDeg(deg: any) {
    deg = requireNumber(deg);
    return Math.tan(deg * (this.PI / 180));
  }

  // --- Hyperbolic Functions ---
  public sinh(n: any) {
    n = requireNumber(n);
    return Math.sinh(n);
  }
  public cosh(n: any) {
    n = requireNumber(n);
    return Math.cosh(n);
  }
  public tanh(n: any) {
    n = requireNumber(n);
    return Math.tanh(n);
  }

  // --- Interpolation & Range ---
  public clamp(n: any, min: any, max: any) {
    n = requireNumber(n);
    min = requireNumber(min);
    max = requireNumber(max);
    return Math.max(min, Math.min(max, n));
  }

  public lerp(start: any, end: any, t: any) {
    start = requireNumber(start);
    end = requireNumber(end);
    t = requireNumber(t);
    return start + (end - start) * t;
  }

  public remap(n: any, start1: any, stop1: any, start2: any, stop2: any) {
    n = requireNumber(n);
    start1 = requireNumber(start1);
    stop1 = requireNumber(stop1);
    start2 = requireNumber(start2);
    stop2 = requireNumber(stop2);
    return start2 + (stop2 - start2) * ((n - start1) / (stop1 - start1));
  }

  // --- Randomness ---
  public random() {
    return Math.random();
  }
  public randomInt(min: any, max: any) {
    min = requireNumber(min);
    max = requireNumber(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  public randomFloat(min: any, max: any) {
    min = requireNumber(min);
    max = requireNumber(max);
    return Math.random() * (max - min) + min;
  }

  // --- Advanced Math ---
  public factorial(n: any): number {
    n = requireNumber(n);
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  public gcd(a: any, b: any): number {
    a = requireNumber(a);
    b = requireNumber(b);
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      a %= b;
      [a, b] = [b, a];
    }
    return a;
  }

  public lcm(a: any, b: any): number {
    a = requireNumber(a);
    b = requireNumber(b);
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / this.gcd(a, b);
  }

  // --- Statistics ---
  public min(...args: any[]) {
    args = requireNumbers(args);
    return Math.min(...args);
  }

  public max(...args: any[]) {
    args = requireNumbers(args);
    return Math.max(...args);
  }

  public sum(...args: any[]) {
    args = requireNumbers(args);
    return args.reduce((a, b) => a + b, 0);
  }

  public mean(...args: any[]) {
    args = requireNumbers(args);
    if (args.length === 0) return 0;
    return this.sum(...args) / args.length;
  }

  public median(...args: any[]) {
    args = requireNumbers(args);
    if (args.length === 0) return 0;
    const sorted = [...args].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1]! + sorted[mid]!) / 2;
  }

  // --- Geometry ---
  public dist(x1: any, y1: any, x2: any, y2: any) {
    x1 = requireNumber(x1);
    y1 = requireNumber(y1);
    x2 = requireNumber(x2);
    y2 = requireNumber(y2);
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  public hypot(...args: any[]) {
    args = requireNumbers(args);
    return Math.hypot(...args);
  }

  // --- Utilities ---
  public toFixed(n: any, digits: any) {
    n = requireNumber(n);
    digits = requireNumber(digits);
    return parseFloat(n.toFixed(digits));
  }
}

export const MathL = ConvertTOMK_Object(new _MathL());
