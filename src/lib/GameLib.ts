import ConvertTOMK_Object from "./BaseLibConverter";
import {
  requireNumber,
  requireNumbers,
  requireString,
} from "./RequireFunctions";

class _GameL {
  // --- Collision Detection ---
  /**
   * Checks if two rectangles are overlapping.
   */
  public intersectRect(
    x1: any,
    y1: any,
    w1: any,
    h1: any,
    x2: any,
    y2: any,
    w2: any,
    h2: any,
  ): boolean {
    x1 = requireNumber(x1);
    y1 = requireNumber(y1);
    w1 = requireNumber(w1);
    h1 = requireNumber(h1);
    x2 = requireNumber(x2);
    y2 = requireNumber(y2);
    w2 = requireNumber(w2);
    h2 = requireNumber(h2);

    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /**
   * Checks if a point is inside a rectangle.
   */
  public pointInRect(
    px: any,
    py: any,
    rx: any,
    ry: any,
    rw: any,
    rh: any,
  ): boolean {
    px = requireNumber(px);
    py = requireNumber(py);
    rx = requireNumber(rx);
    ry = requireNumber(ry);
    rw = requireNumber(rw);
    rh = requireNumber(rh);

    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  }

  // --- Movement & Math Helpers ---
  /**
   * Moves a value towards a target by a maximum amount.
   */
  public moveTowards(current: any, target: any, maxDelta: any): number {
    current = requireNumber(current);
    target = requireNumber(target);
    maxDelta = requireNumber(maxDelta);

    if (Math.abs(target - current) <= maxDelta) {
      return target;
    }
    return current + Math.sign(target - current) * maxDelta;
  }

  /**
   * Linearly interpolates between two values.
   */
  public lerp(a: any, b: any, t: any): number {
    a = requireNumber(a);
    b = requireNumber(b);
    t = requireNumber(t);
    return a + (b - a) * t;
  }

  /**
   * Smoothly interpolates between 0 and 1.
   */
  public smoothstep(edge0: any, edge1: any, x: any): number {
    edge0 = requireNumber(edge0);
    edge1 = requireNumber(edge1);
    x = requireNumber(x);

    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  /**
   * Returns the shortest difference between two angles in radians.
   */
  public deltaAngle(a: any, b: any): number {
    a = requireNumber(a);
    b = requireNumber(b);
    let delta = (b - a) % (Math.PI * 2);
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    return delta;
  }

  /**
   * Returns the direction from (x1, y1) to (x2, y2) in radians.
   */
  public angleTo(x1: any, y1: any, x2: any, y2: any): number {
    x1 = requireNumber(x1);
    y1 = requireNumber(y1);
    x2 = requireNumber(x2);
    y2 = requireNumber(y2);
    return Math.atan2(y2 - y1, x2 - x1);
  }

  // --- Random Utilities ---
  /**
   * Returns true based on a probability (0.0 to 1.0).
   */
  public chance(p: any): boolean {
    p = requireNumber(p);
    return Math.random() < p;
  }

  /**
   * Returns a random value between -magnitude and +magnitude.
   */
  public shake(magnitude: any): number {
    magnitude = requireNumber(magnitude);
    return (Math.random() * 2 - 1) * magnitude;
  }

  /**
   * Returns a random element from an array (or arguments).
   */
  public choose(...args: any[]): any {
    if (args.length === 0) return null;
    return args[Math.floor(Math.random() * args.length)];
  }

  // --- Conversion ---
  public degToRad(deg: any): number {
    deg = requireNumber(deg);
    return deg * (Math.PI / 180);
  }

  public radToDeg(rad: any): number {
    rad = requireNumber(rad);
    return rad * (180 / Math.PI);
  }

  // --- Gameplay Logic Helpers ---
  /**
   * Applies a deadzone to an input value.
   */
  public deadzone(value: any, threshold: any): number {
    value = requireNumber(value);
    threshold = requireNumber(threshold);
    return Math.abs(value) < threshold ? 0 : value;
  }

  /**
   * Repeats a value in the range [0, length].
   */
  public repeat(t: any, length: any): number {
    t = requireNumber(t);
    length = requireNumber(length);
    return t - Math.floor(t / length) * length;
  }

  /**
   * Ping-pongs a value so it goes from 0 to length and back to 0.
   */
  public pingPong(t: any, length: any): number {
    t = requireNumber(t);
    length = requireNumber(length);
    t = this.repeat(t, length * 2);
    return length - Math.abs(t - length);
  }
}

export const GameL = ConvertTOMK_Object(new _GameL());
