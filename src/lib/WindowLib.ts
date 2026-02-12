import { dlopen, FFIType, suffix } from "bun:ffi";
import type { FunctionValue, RuntimeValue } from "../runtime/values";
import Environment from "../runtime/environment";
import { evaluate } from "../runtime/interpreter";
import { requireNumber, requireString } from "./RequireFunctions";
import ConvertTOMK_Object from "./BaseLibConverter";

// 1. Dynamic Path Loading (Detects .dll, .so, or .dylib automatically)
const libPath = `lib/libraylib.${suffix}`;

const lib = dlopen(libPath, {
  InitWindow: {
    args: [FFIType.i32, FFIType.i32, FFIType.cstring],
    returns: FFIType.void,
  },
  WindowShouldClose: { args: [], returns: FFIType.bool },
  CloseWindow: { args: [], returns: FFIType.void },
  BeginDrawing: { args: [], returns: FFIType.void },
  EndDrawing: { args: [], returns: FFIType.void },
  SetTargetFPS: { args: [FFIType.i32], returns: FFIType.void },
  ClearBackground: { args: [FFIType.u32], returns: FFIType.void },
  DrawRectangle: {
    args: [FFIType.i32, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.u32],
    returns: FFIType.void,
  },
  DrawCircle: {
    args: [FFIType.i32, FFIType.i32, FFIType.f32, FFIType.u32],
    returns: FFIType.void,
  },
  DrawText: {
    args: [FFIType.cstring, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.u32],
    returns: FFIType.void,
  },
  GetMouseX: { args: [], returns: FFIType.i32 },
  GetMouseY: { args: [], returns: FFIType.i32 },
  IsKeyDown: { args: [FFIType.i32], returns: FFIType.bool },
  IsMouseButtonPressed: { args: [FFIType.i32], returns: FFIType.bool },
  IsMouseButtonDown: { args: [FFIType.i32], returns: FFIType.bool },
  MeasureText: { args: [FFIType.cstring, FFIType.i32], returns: FFIType.i32 },
});

// Color utility (Raylib uses RGBA as a single u32)
const COLORS = {
  black: 0xff000000,
  white: 0xffffffff,
  red: 0xff0000ff,
  green: 0xff00ff00,
  blue: 0xffff0000,
};
const KEYS: Record<string, number> = {
  // Alphanumeric keys
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  Zero: 48,
  One: 49,
  Two: 50,
  Three: 51,
  Four: 52,
  Five: 53,
  Six: 54,
  Seven: 55,
  Eight: 56,
  Nine: 57,

  // Control keys
  Space: 32,
  Escape: 256,
  Enter: 257,
  Tab: 258,
  Backspace: 259,
  Insert: 260,
  Delete: 261,
  Right: 262,
  Left: 263,
  Down: 264,
  Up: 265,
  ArrowRight: 262,
  ArrowLeft: 263,
  ArrowDown: 264,
  ArrowUp: 265,
  PageUp: 266,
  PageDown: 267,
  Home: 268,
  End: 269,
  CapsLock: 280,
  ScrollLock: 281,
  NumLock: 282,
  PrintScreen: 283,
  Pause: 284,
  F1: 290,
  F2: 291,
  F3: 292,
  F4: 293,
  F5: 294,
  F6: 295,
  F7: 296,
  F8: 297,
  F9: 298,
  F10: 299,
  F11: 300,
  F12: 301,
  LeftShift: 340,
  LeftControl: 341,
  LeftAlt: 342,
  LeftSuper: 343,
  RightShift: 344,
  RightControl: 345,
  RightAlt: 346,
  RightSuper: 347,
  KBMenu: 348,
};

const MOUSE: Record<string, number> = {
  left: 0,
  right: 1,
  middle: 2,
  side: 3,
  extra: 4,
  forward: 5,
  back: 6,
};

class _WindowL {
  private updateCallback: FunctionValue | null = null;
  private env: Environment | null = null;
  private activeColor: number = COLORS.white;

  public create(width: any, height: any, title: any) {
    const w = requireNumber(width);
    const h = requireNumber(height);
    const t = requireString(title);

    // C-strings in FFI require a null terminator
    lib.symbols.InitWindow(w, h, Buffer.from(t + "\0"));
    lib.symbols.SetTargetFPS(60);

    // Start the Game Loop
    this.gameLoop();
  }

  private gameLoop() {
    const tick = () => {
      if (lib.symbols.WindowShouldClose()) {
        lib.symbols.CloseWindow();
        process.exit(0);
      }

      lib.symbols.BeginDrawing();
      try {
        if (this.updateCallback && this.env) {
          this.executeCallback(this.updateCallback, this.env);
        }
      } catch (e) {
        console.error("Runtime Error in update callback:", e);
        // Note: We don't exit here so the window stays open for debugging
      }
      lib.symbols.EndDrawing();

      // Uses Bun's high-efficiency tick
      setImmediate(tick);
    };
    tick();
  }

  public onUpdate(fn: FunctionValue, _: RuntimeValue[], env: Environment) {
    this.updateCallback = fn;
    this.env = env;
  }

  private parseColor(color: any): number {
    if (typeof color === "number") return color >>> 0;

    let c = "";
    if (typeof color === "string") {
      c = color.trim();
    } else if (color && typeof (color as any).value === "string") {
      c = (color as any).value.trim();
    } else if (Array.isArray(color) && color.length > 0) {
      const firstArg = color[0];
      if (typeof firstArg === "string") c = firstArg.trim();
      else if (firstArg && typeof (firstArg as any).value === "string")
        c = (firstArg as any).value.trim();
    }

    if (!c) return COLORS.black;

    if (COLORS[c.toLowerCase() as keyof typeof COLORS])
      return COLORS[c.toLowerCase() as keyof typeof COLORS];

    if (c.startsWith("#")) {
      const hex = c.substring(1);
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return (r | (g << 8) | (b << 16) | (0xff << 24)) >>> 0;
      } else if (hex.length === 3) {
        const r = parseInt(hex[0]! + hex[0]!, 16);
        const g = parseInt(hex[1]! + hex[1]!, 16);
        const b = parseInt(hex[2]! + hex[2]!, 16);
        return (r | (g << 8) | (b << 16) | (0xff << 24)) >>> 0;
      }
    }

    return COLORS.black;
  }

  public clear(color: any) {
    lib.symbols.ClearBackground(this.parseColor(color));
  }

  public setColor(color: any) {
    this.activeColor = this.parseColor(color);
  }

  public drawRect(x: any, y: any, w: any, h: any) {
    lib.symbols.DrawRectangle(
      requireNumber(x),
      requireNumber(y),
      requireNumber(w),
      requireNumber(h),
      this.activeColor,
    );
  }

  public drawCircle(x: any, y: any, r: any) {
    lib.symbols.DrawCircle(
      requireNumber(x),
      requireNumber(y),
      requireNumber(r),
      this.activeColor,
    );
  }

  public drawText(text: any, x: any, y: any, size: any = 20) {
    lib.symbols.DrawText(
      Buffer.from(requireString(text) + "\0"),
      requireNumber(x),
      requireNumber(y),
      requireNumber(size),
      this.activeColor,
    );
  }

  public getMouseX() {
    return lib.symbols.GetMouseX();
  }
  public getMouseY() {
    return lib.symbols.GetMouseY();
  }
  public getKeyDown(key: any) {
    let k = "";
    if (typeof key === "string") k = key;
    else if (key && (key as any).type === "string") k = (key as any).value;
    else if (Array.isArray(key) && key.length > 0) {
      const firstArg = key[0];
      if (typeof firstArg === "string") k = firstArg;
      else if (firstArg && (firstArg as any).type === "string")
        k = (firstArg as any).value;
    }

    return lib.symbols.IsKeyDown(KEYS[k] || 0);
  }

  public getMouseButton(button: any) {
    let btnName = "left";
    if (typeof button === "string") btnName = button;
    else if (button && (button as any).type === "string")
      btnName = (button as any).value;
    else if (Array.isArray(button) && button.length > 0) {
      const firstArg = button[0];
      if (typeof firstArg === "string") btnName = firstArg;
      else if (firstArg && (firstArg as any).type === "string")
        btnName = (firstArg as any).value;
    }

    return lib.symbols.IsMouseButtonPressed(MOUSE[btnName] || 0);
  }

  public measureText(text: any, size: any) {
    return lib.symbols.MeasureText(
      Buffer.from(requireString(text) + "\0"),
      requireNumber(size),
    );
  }

  private executeCallback(func: FunctionValue, env: Environment) {
    const scope = new Environment(func.declarationEnv);
    for (const stmt of func.body) {
      evaluate(stmt, scope);
    }
  }
}

export function createWindowLib() {
  return ConvertTOMK_Object(new _WindowL());
}
