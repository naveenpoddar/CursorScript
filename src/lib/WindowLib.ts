import { Window } from "skia-canvas";
import type { FunctionValue, RuntimeValue } from "../runtime/values";
import { MK_NULL } from "../runtime/values";
import Environment from "../runtime/environment";
import { evaluate } from "../runtime/interpreter";
import { requireNumber, requireString } from "./RequireFunctions";
import ConvertTOMK_Object from "./BaseLibConverter";

class _WindowL {
  private win: Window | null = null;
  private ctx: any = null;
  private updateCallback: FunctionValue | null = null;
  private env: Environment | null = null;
  private keysDown: Set<string> = new Set();
  private mouseX: number = 0;
  private mouseY: number = 0;
  private mouseDown: boolean = false;

  public create(width: any, height: any, title: any) {
    const w = requireNumber(width);
    const h = requireNumber(height);
    const t = requireString(title);

    if (this.win) {
      this.win.close();
    }

    this.win = new Window(w, h);
    this.win.title = t;

    this.win.on("draw", (event) => {
      this.ctx = event.target.canvas.getContext("2d");

      if (this.updateCallback && this.env) {
        this.executeCallback(this.updateCallback, this.env);
      }
    });

    this.win.on("keydown", (e) => this.keysDown.add(e.key));
    this.win.on("keyup", (e) => this.keysDown.delete(e.key));
    this.win.on("mousemove", (e) => {
      this.mouseX = e.x;
      this.mouseY = e.y;
    });
    this.win.on("mousedown", () => (this.mouseDown = true));
    this.win.on("mouseup", () => (this.mouseDown = false));

    console.log(`Window "${t}" created (${w}x${h})`);
  }

  public getKeyDown(key: any) {
    const k = requireString(key);
    return this.keysDown.has(k);
  }

  public getMouseX() {
    return this.mouseX;
  }

  public getMouseY() {
    return this.mouseY;
  }

  public getMouseButton() {
    return this.mouseDown;
  }

  /**
   * Registers a callback function to be called every frame.
   * Signature matches BaseLibConverter: (rawArg1, ..., rawArgN, fullArgs[], env)
   */
  public onUpdate(fn: FunctionValue, _: RuntimeValue[], env: Environment) {
    if (!fn || (fn as any).type !== "function") {
      throw "onUpdate expects a function callback.";
    }
    this.updateCallback = fn;
    this.env = env;
  }

  public clear(color: any) {
    const c = requireString(color);
    if (!this.ctx) return;
    this.ctx.fillStyle = c;
    this.ctx.fillRect(0, 0, this.win!.width, this.win!.height);
  }

  public setColor(color: any) {
    const c = requireString(color);
    if (!this.ctx) return;
    this.ctx.fillStyle = c;
    this.ctx.strokeStyle = c;
  }

  public drawRect(x: any, y: any, w: any, h: any) {
    if (!this.ctx) return;
    this.ctx.fillRect(
      requireNumber(x),
      requireNumber(y),
      requireNumber(w),
      requireNumber(h),
    );
  }

  public strokeRect(x: any, y: any, w: any, h: any) {
    if (!this.ctx) return;
    this.ctx.strokeRect(
      requireNumber(x),
      requireNumber(y),
      requireNumber(w),
      requireNumber(h),
    );
  }

  public drawCircle(x: any, y: any, r: any) {
    if (!this.ctx) return;
    const nx = requireNumber(x);
    const ny = requireNumber(y);
    const nr = requireNumber(r);

    this.ctx.beginPath();
    this.ctx.arc(nx, ny, nr, 0, Math.PI * 2);
    this.ctx.fill();
  }

  public drawText(text: any, x: any, y: any, size: any = 16) {
    if (!this.ctx) return;
    const s = requireNumber(size);
    this.ctx.font = `${s}px sans-serif`;
    this.ctx.fillText(requireString(text), requireNumber(x), requireNumber(y));
  }

  public close() {
    if (this.win) {
      this.win.close();
      this.win = null;
      this.ctx = null;
    }
  }

  private executeCallback(func: FunctionValue, env: Environment) {
    const scope = new Environment(func.declarationEnv);
    try {
      for (const stmt of func.body) {
        evaluate(stmt, scope);
      }
    } catch (err) {
      console.error("Error in Window Update Callback:", err);
      this.close();
    }
  }
}

export function createWindowLib() {
  return ConvertTOMK_Object(new _WindowL());
}
