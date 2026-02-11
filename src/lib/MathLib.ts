import ConvertTOMK_Object from "./BaseLibConverter";

class _MathL {
  // --- Constants ---
  public readonly PI = Math.PI;
  public readonly E = Math.E;
  public readonly TAU = Math.PI * 2;
  public readonly PHI = 1.618033988749895; // Golden Ratio
  public readonly SQRT2 = Math.SQRT2;

  // --- Basic Functions ---
  public abs(n: number) {
    return Math.abs(n);
  }
  public sign(n: number) {
    return Math.sign(n);
  }
  public round(n: number) {
    return Math.round(n);
  }
  public floor(n: number) {
    return Math.floor(n);
  }
  public ceil(n: number) {
    return Math.ceil(n);
  }
  public trunc(n: number) {
    return Math.trunc(n);
  }

  // --- Power & Roots ---
  public pow(base: number, exp: number) {
    return Math.pow(base, exp);
  }
  public sqrt(n: number) {
    return Math.sqrt(n);
  }
  public cbrt(n: number) {
    return Math.cbrt(n);
  }
  public root(n: number, r: number) {
    return Math.pow(n, 1 / r);
  }

  // --- Trigonometry (Radians) ---
  public sin(n: number) {
    return Math.sin(n);
  }
  public cos(n: number) {
    return Math.cos(n);
  }
  public tan(n: number) {
    return Math.tan(n);
  }
  public asin(n: number) {
    return Math.asin(n);
  }
  public acos(n: number) {
    return Math.acos(n);
  }
  public atan(n: number) {
    return Math.atan(n);
  }
  public atan2(y: number, x: number) {
    return Math.atan2(y, x);
  }

  // --- Trigonometry (Degrees) ---
  public sinDeg(deg: number) {
    return Math.sin(deg * (this.PI / 180));
  }
  public cosDeg(deg: number) {
    return Math.cos(deg * (this.PI / 180));
  }
  public tanDeg(deg: number) {
    return Math.tan(deg * (this.PI / 180));
  }

  // --- Hyperbolic Functions ---
  public sinh(n: number) {
    return Math.sinh(n);
  }
  public cosh(n: number) {
    return Math.cosh(n);
  }
  public tanh(n: number) {
    return Math.tanh(n);
  }

  // --- Interpolation & Range ---
  public clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  public lerp(start: number, end: number, t: number) {
    return start + (end - start) * t;
  }

  public remap(
    n: number,
    start1: number,
    stop1: number,
    start2: number,
    stop2: number,
  ) {
    return start2 + (stop2 - start2) * ((n - start1) / (stop1 - start1));
  }

  // --- Randomness ---
  public random() {
    return Math.random();
  }
  public randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  public randomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // --- Advanced Math ---
  public factorial(n: number): number {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  public gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      a %= b;
      [a, b] = [b, a];
    }
    return a;
  }

  public lcm(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / this.gcd(a, b);
  }

  // --- Statistics ---
  public min(...args: number[]) {
    return Math.min(...args);
  }

  public max(...args: number[]) {
    return Math.max(...args);
  }

  public sum(...args: number[]) {
    return args.reduce((a, b) => a + b, 0);
  }

  public mean(...args: number[]) {
    if (args.length === 0) return 0;
    return this.sum(...args) / args.length;
  }

  public median(...args: number[]) {
    if (args.length === 0) return 0;
    const sorted = [...args].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1]! + sorted[mid]!) / 2;
  }

  // --- Geometry ---
  public dist(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  public hypot(...args: number[]) {
    return Math.hypot(...args);
  }

  // --- Utilities ---
  public toFixed(n: number, digits: number) {
    return parseFloat(n.toFixed(digits));
  }
}

export const MathL = ConvertTOMK_Object(new _MathL());
