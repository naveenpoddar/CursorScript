import ConvertTOMK_Object from "./BaseLibConverter";
import { requireNumber } from "./RequireFunctions";

class _PerlinNoise {
  private p: number[] = new Array(512);

  constructor() {
    this.seed(0);
  }

  // Linear interpolation
  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  // Fade function
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  // Gradient
  private grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    let v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  public seed(seedVal: any) {
    let s = requireNumber(seedVal);
    // Simple PRNG
    const p = new Array(256);
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // Shuffle
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      let swapIndex = Math.abs(s) % (i + 1);
      let temp = p[i] as number;
      p[i] = p[swapIndex];
      p[swapIndex] = temp;
    }

    for (let i = 0; i < 512; i++) {
      this.p[i] = p[i & 255] as number;
    }
  }

  public noise2D(xVal: any, yVal: any): number {
    let x = requireNumber(xVal);
    let y = requireNumber(yVal);
    let z = 0;

    let X = Math.floor(x) & 255;
    let Y = Math.floor(y) & 255;
    let Z = 0;

    x -= Math.floor(x);
    y -= Math.floor(y);

    let u = this.fade(x);
    let v = this.fade(y);
    let w = this.fade(z);

    let A = (this.p[X] as number) + Y,
      AA = (this.p[A] as number) + Z,
      AB = (this.p[A + 1] as number) + Z;
    let B = (this.p[X + 1] as number) + Y,
      BA = (this.p[B] as number) + Z,
      BB = (this.p[B + 1] as number) + Z;

    let res = this.lerp(
      w,
      this.lerp(
        v,
        this.lerp(
          u,
          this.grad(this.p[AA] as number, x, y, z),
          this.grad(this.p[BA] as number, x - 1, y, z),
        ),
        this.lerp(
          u,
          this.grad(this.p[AB] as number, x, y - 1, z),
          this.grad(this.p[BB] as number, x - 1, y - 1, z),
        ),
      ),
      this.lerp(
        v,
        this.lerp(
          u,
          this.grad(this.p[AA + 1] as number, x, y, z - 1),
          this.grad(this.p[BA + 1] as number, x - 1, y, z - 1),
        ),
        this.lerp(
          u,
          this.grad(this.p[AB + 1] as number, x, y - 1, z - 1),
          this.grad(this.p[BB + 1] as number, x - 1, y - 1, z - 1),
        ),
      ),
    );

    // return value in [0, 1] range rather than [-1, 1]
    return (res + 1) / 2;
  }
}

export const PerlinNoiseL = ConvertTOMK_Object(new _PerlinNoise());
