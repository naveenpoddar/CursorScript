import { dlopen, FFIType, suffix, ptr } from "bun:ffi";
import type { FunctionValue, RuntimeValue } from "../runtime/values";
import { requireNumber, requireString } from "./RequireFunctions";
import { executeCallback } from "./Utils";
import ConvertTOMK_Object from "./BaseLibConverter";
import { join, dirname } from "path";
import { existsSync } from "node:fs";

// 1. Dynamic Path Loading (Detects .dll, .so, or .dylib automatically)
const isCompiled = Bun.main === process.execPath;

const devPath = join(
  import.meta.dir,
  "..",
  "..",
  "lib",
  "raylib",
  `libraylib.${suffix}`,
);
const buildPath = join(
  dirname(process.execPath),
  "lib",
  "raylib",
  `libraylib.${suffix}`,
);

// If compiled, prefer the library bundled with the executable
const libPath = isCompiled
  ? buildPath
  : existsSync(devPath)
    ? devPath
    : buildPath;

if (!existsSync(libPath)) {
  console.error(
    `\n❌ Native Library Error: Could not find libraythis.lib.${suffix}`,
  );
  console.error(`   Mode: ${isCompiled ? "Compiled" : "Development"}`);
  console.error(`   Searched Path: ${libPath}`);
  console.error(
    `   Please ensure the 'lib' folder exists next to the ${isCompiled ? "executable" : "source folder"}.\n`,
  );
}
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

// Explicitly define the flags
const FLAG_VSYNC_HINT = 0x00000040; // 64
const FLAG_WINDOW_RESIZABLE = 0x00000004; // 4 (Note: This is often 4, not 8!)
const FLAG_FULLSCREEN_MODE = 0x00000002; // 2
const FLAG_WINDOW_HIGHDPI = 0x00002000; // 8192

function createWindowLibrary() {
  return dlopen(libPath, {
    InitWindow: {
      args: [FFIType.i32, FFIType.i32, FFIType.cstring],
      returns: FFIType.void,
    },
    WindowShouldClose: { args: [], returns: FFIType.bool },
    CloseWindow: { args: [], returns: FFIType.void },
    BeginDrawing: { args: [], returns: FFIType.void },
    EndDrawing: { args: [], returns: FFIType.void },
    BeginBlendMode: { args: [FFIType.i32], returns: FFIType.void },
    EndBlendMode: { args: [], returns: FFIType.void },
    SetTargetFPS: { args: [FFIType.i32], returns: FFIType.void },
    ClearBackground: { args: [FFIType.u32], returns: FFIType.void },
    DrawRectangle: {
      args: [FFIType.i32, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.u32],
      returns: FFIType.void,
    },
    DrawTriangleFan: {
      args: [
        FFIType.ptr, // point to array of Vector2 structs
        FFIType.i32, // pointCount
        FFIType.u32, // color
      ],
      returns: FFIType.void,
    },
    DrawLine: {
      args: [FFIType.i32, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.u32],
      returns: FFIType.void,
    },
    DrawCircle: {
      args: [FFIType.i32, FFIType.i32, FFIType.f32, FFIType.u32],
      returns: FFIType.void,
    },
    DrawText: {
      args: [
        FFIType.cstring,
        FFIType.i32,
        FFIType.i32,
        FFIType.i32,
        FFIType.u32,
      ],
      returns: FFIType.void,
    },
    GetMouseX: { args: [], returns: FFIType.i32 },
    GetMouseY: { args: [], returns: FFIType.i32 },
    IsKeyDown: { args: [FFIType.i32], returns: FFIType.bool },
    IsMouseButtonPressed: { args: [FFIType.i32], returns: FFIType.bool },
    IsMouseButtonDown: { args: [FFIType.i32], returns: FFIType.bool },
    MeasureText: {
      args: [FFIType.cstring, FFIType.i32],
      returns: FFIType.i32,
    },
    DisableCursor: { args: [], returns: FFIType.void },
    EnableCursor: { args: [], returns: FFIType.void },
    GetMouseDelta: { args: [], returns: FFIType.f64 }, // Packs the 8-byte Vector2 struct
    GetMouseWheelMove: { args: [], returns: FFIType.f32 },
    ToggleFullscreen: { args: [], returns: FFIType.void },
    SetConfigFlags: { args: [FFIType.u32], returns: FFIType.void },
    GetMonitorWidth: { args: [FFIType.i32], returns: FFIType.i32 },
    GetMonitorHeight: { args: [FFIType.i32], returns: FFIType.i32 },
    GetCurrentMonitor: { args: [], returns: FFIType.i32 },
    GetScreenWidth: { args: [], returns: FFIType.i32 },
    GetScreenHeight: { args: [], returns: FFIType.i32 },
  });
}

export class _WindowL {
  private updateCallback: any = null;
  private fixedUpdateCallback: any = null;
  private activeColor: number = COLORS.white;
  private lastTime: number = performance.now();
  private accumulatedTime: number = 0;
  private readonly fixedTimeStep: number = 0.01666; // ~60Hz fixed update

  public initilized: boolean = false;
  public lib: ReturnType<typeof createWindowLibrary> = {} as any;

  constructor() {
    global.windowLib = this;
  }

  public init() {
    this.lib = createWindowLibrary();
    global.windowLib = this;
    this.initilized = true;
  }

  public create(width: any, height: any, title: any, _fullscreen: any) {
    if (!this.initilized) this.init();
    if (!this.lib) return console.error("WindowLib failed to initialize");

    const w = requireNumber(width);
    const h = requireNumber(height);
    const t = requireString(title);

    const fullscreen = _fullscreen ?? false;

    let flags = FLAG_VSYNC_HINT | FLAG_WINDOW_RESIZABLE | FLAG_WINDOW_HIGHDPI;

    if (fullscreen) {
      flags |= FLAG_FULLSCREEN_MODE;
    }

    // Set the flags BEFORE InitWindow
    this.lib.symbols.SetConfigFlags(flags);

    // C-strings in FFI require a null terminator
    this.lib.symbols.InitWindow(w, h, Buffer.from(t + "\0"));

    // Safety: If it's STILL going fullscreen, force it back after Init
    if (!fullscreen) {
      // You might need to export 'ClearWindowState' from your dlopen if this persists
    }

    this.lib.symbols.SetTargetFPS(60);
    // Start the Game Loop
    this.gameLoop();
  }

  public toggleFullscreen() {
    this.lib.symbols.ToggleFullscreen();
  }

  public getMonitorWidth(monitor: any = 0) {
    return this.lib.symbols.GetMonitorWidth(requireNumber(monitor));
  }

  public getMonitorHeight(monitor: any = 0) {
    return this.lib.symbols.GetMonitorHeight(requireNumber(monitor));
  }

  public getCurrentMonitor() {
    return this.lib.symbols.GetCurrentMonitor();
  }

  public getWidth() {
    return this.lib.symbols.GetScreenWidth();
  }

  public getHeight() {
    return this.lib.symbols.GetScreenHeight();
  }

  private gameLoop() {
    const tick = async () => {
      if (this.lib.symbols.WindowShouldClose()) {
        this.lib.symbols.CloseWindow();
        process.exit(0);
      }

      // Timing
      const currentTime = performance.now();
      const deltaTime = (currentTime - this.lastTime) / 1000.0;
      this.lastTime = currentTime;
      this.accumulatedTime += deltaTime;

      // --- 1. Fixed Update Loop (Physics) ---
      // We run this at a consistent 60Hz regardless of rendering speed
      while (this.accumulatedTime >= this.fixedTimeStep) {
        try {
          if (this.fixedUpdateCallback) {
            await executeCallback(this.fixedUpdateCallback);
          }
        } catch (e) {
          console.error("Runtime Error in fixedUpdate callback:", e);
        }
        this.accumulatedTime -= this.fixedTimeStep;
      }

      // --- 2. Update Loop (Render & Input) ---
      this.lib.symbols.BeginDrawing();
      try {
        if (this.updateCallback) {
          await executeCallback(this.updateCallback);
        }
      } catch (e) {
        console.error("Runtime Error in update callback:", e);
      }
      this.lib.symbols.EndDrawing();

      // Uses Bun's high-efficiency tick
      setImmediate(tick);
    };
    tick();
  }

  public onUpdate(fn: any) {
    this.updateCallback = fn;
  }

  public onFixedUpdate(fn: any) {
    this.fixedUpdateCallback = fn;
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

    if (c.startsWith("rgba(")) {
      const parts = c.substring(5, c.length - 1).split(",");
      if (parts.length === 4) {
        const r = parseInt(parts[0]!.trim());
        const g = parseInt(parts[1]!.trim());
        const b = parseInt(parts[2]!.trim());
        const a = Math.floor(parseFloat(parts[3]!.trim()) * 255);
        return (r | (g << 8) | (b << 16) | (a << 24)) >>> 0;
      }
    }

    return COLORS.black;
  }

  public clear(color: any) {
    this.lib.symbols.ClearBackground(this.parseColor(color));
  }

  public setColor(color: any) {
    this.activeColor = this.parseColor(color);
  }

  public drawRect(x: any, y: any, w: any, h: any) {
    this.lib.symbols.DrawRectangle(
      requireNumber(x),
      requireNumber(y),
      requireNumber(w),
      requireNumber(h),
      this.activeColor,
    );
  }

  public drawTriangle(x1: any, y1: any, x2: any, y2: any, x3: any, y3: any) {
    const points = new Float32Array([
      requireNumber(x1),
      requireNumber(y1),
      requireNumber(x2),
      requireNumber(y2),
      requireNumber(x3),
      requireNumber(y3),
    ]);
    this.lib.symbols.DrawTriangleFan(ptr(points), 3, this.activeColor);
  }

  public drawQuad(
    x1: any,
    y1: any,
    x2: any,
    y2: any,
    x3: any,
    y3: any,
    x4: any,
    y4: any,
  ) {
    const points = new Float32Array([
      requireNumber(x1),
      requireNumber(y1),
      requireNumber(x2),
      requireNumber(y2),
      requireNumber(x3),
      requireNumber(y3),
      requireNumber(x4),
      requireNumber(y4),
    ]);
    this.lib.symbols.DrawTriangleFan(ptr(points), 4, this.activeColor);
  }

  public drawLine(startX: any, startY: any, endX: any, endY: any) {
    this.lib.symbols.DrawLine(
      requireNumber(startX),
      requireNumber(startY),
      requireNumber(endX),
      requireNumber(endY),
      this.activeColor,
    );
  }

  public drawCircle(x: any, y: any, r: any) {
    this.lib.symbols.DrawCircle(
      requireNumber(x),
      requireNumber(y),
      requireNumber(r),
      this.activeColor,
    );
  }

  public drawText(text: any, x: any, y: any, size: any = 20) {
    this.lib.symbols.DrawText(
      Buffer.from(requireString(text) + "\0"),
      requireNumber(x),
      requireNumber(y),
      requireNumber(size),
      this.activeColor,
    );
  }

  public getMouseX() {
    return this.lib.symbols.GetMouseX();
  }
  public getMouseY() {
    return this.lib.symbols.GetMouseY();
  }

  public disableCursor() {
    this.lib.symbols.DisableCursor();
  }

  public enableCursor() {
    this.lib.symbols.EnableCursor();
  }

  public getMouseDeltaX() {
    let delta = this.lib.symbols.GetMouseDelta() as number;
    let buf = new Float64Array([delta]);
    let f32 = new Float32Array(buf.buffer);
    return f32[0];
  }

  public getMouseDeltaY() {
    let delta = this.lib.symbols.GetMouseDelta() as number;
    let buf = new Float64Array([delta]);
    let f32 = new Float32Array(buf.buffer);
    return f32[1];
  }

  public getMouseWheel() {
    return this.lib.symbols.GetMouseWheelMove();
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

    return this.lib.symbols.IsKeyDown(KEYS[k] || 0);
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

    return this.lib.symbols.IsMouseButtonPressed(MOUSE[btnName] || 0);
  }

  public measureText(text: any, size: any) {
    return this.lib.symbols.MeasureText(
      Buffer.from(requireString(text) + "\0"),
      requireNumber(size),
    );
  }
}

export function createWindowLib() {
  return ConvertTOMK_Object(new _WindowL());
}

export function parseColor(color: any): number {
  return (new _WindowL() as any).parseColor(color);
}

export { COLORS, createWindowLibrary };
