import { Window } from "skia-canvas";
import type {
  FunctionValue,
  RuntimeValue,
  ObjectValue,
} from "../runtime/values";
import { MK_NULL, MK_NUMBER, MK_NATIVE_FN, MK_OBJECT } from "../runtime/values";
import Environment from "../runtime/environment";
import { evaluate } from "../runtime/interpreter";
import { requireNumber, requireString } from "./RequireFunctions";

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
    this.win.on("mousedown", () => this.mouseDown = true);
    this.win.on("mouseup", () => this.mouseDown = false);

    console.log(`Window "${t}" created (${w}x${h})`);
    return MK_NULL();
  }

  public getKeyDown(key: any) {
    const k = requireString(key);
    return { type: "boolean", value: this.keysDown.has(k) } as any;
  }

  public getMouseX() {
    return MK_NUMBER(this.mouseX);
  }

  public getMouseY() {
    return MK_NUMBER(this.mouseY);
  }

  public getMouseButton() {
    return { type: "boolean", value: this.mouseDown } as any;
  }

  /**
   * Registers a callback function to be called every frame.
   */
  public onUpdate(args: RuntimeValue[], env: Environment) {
    const fn = args[0] as FunctionValue;
    if (fn.type !== "function") {
      throw "onUpdate expects a function callback.";
    }
    this.updateCallback = fn;
    this.env = env;
    return MK_NULL();
  }

  /**
   * Clears the window with a specific color.
   */
  public clear(color: any) {
    const c = requireString(color);
    if (!this.ctx) return MK_NULL();

    this.ctx.fillStyle = c;
    this.ctx.fillRect(0, 0, this.win!.width, this.win!.height);
    return MK_NULL();
  }

  /**
   * Sets the current drawing color.
   */
  public setColor(color: any) {
    const c = requireString(color);
    if (!this.ctx) return MK_NULL();
    this.ctx.fillStyle = c;
    this.ctx.strokeStyle = c;
    return MK_NULL();
  }

  /**
   * Draws a filled rectangle.
   */
  public drawRect(x: any, y: any, w: any, h: any) {
    if (!this.ctx) return MK_NULL();
    this.ctx.fillRect(
      requireNumber(x),
      requireNumber(y),
      requireNumber(w),
      requireNumber(h),
    );
    return MK_NULL();
  }

  /**
   * Draws a rectangle outline.
   */
  public strokeRect(x: any, y: any, w: any, h: any) {
    if (!this.ctx) return MK_NULL();
    this.ctx.strokeRect(
      requireNumber(x),
      requireNumber(y),
      requireNumber(w),
      requireNumber(h),
    );
    return MK_NULL();
  }

  /**
   * Draws a filled circle.
   */
  public drawCircle(x: any, y: any, r: any) {
    if (!this.ctx) return MK_NULL();
    const nx = requireNumber(x);
    const ny = requireNumber(y);
    const nr = requireNumber(r);

    this.ctx.beginPath();
    this.ctx.arc(nx, ny, nr, 0, Math.PI * 2);
    this.ctx.fill();
    return MK_NULL();
  }

  /**
   * Draws text.
   */
  public drawText(text: any, x: any, y: any, size: any = 16) {
    if (!this.ctx) return MK_NULL();
    const s = requireNumber(size);
    this.ctx.font = `${s}px sans-serif`;
    this.ctx.fillText(requireString(text), requireNumber(x), requireNumber(y));
    return MK_NULL();
  }

  /**
   * Closes the window.
   */
  public close() {
    if (this.win) {
      this.win.close();
      this.win = null;
      this.ctx = null;
    }
    return MK_NULL();
  }

  /**
   * Helper to execute a CursorScript function from native code.
   */
  private executeCallback(func: FunctionValue, env: Environment) {
    const scope = new Environment(func.declarationEnv);

    // In Unity style, we might want to provide some global variables in the scope
    // instead of arguments, or just keep it simple.

    let result: RuntimeValue = MK_NULL();
    try {
      for (const stmt of func.body) {
        result = evaluate(stmt, scope);
      }
    } catch (err) {
      console.error("Error in Window Update Callback:", err);
      this.close();
    }
    return result;
  }
}

// We manually create the MK_OBJECT to handle the special onUpdate logic
// and avoid the generic BaseLibConverter limitations with callbacks for now.
export function createWindowLib() {
  const instance = new _WindowL();
  const props = new Map<string, RuntimeValue>();

  props.set(
    "create",
    MK_NATIVE_FN((args) =>
      instance.create(args[0]!.value, args[1]!.value, args[2]!.value),
    ),
  );
  props.set(
    "onUpdate",
    MK_NATIVE_FN((args, env) => instance.onUpdate(args, env)),
  );
  props.set(
    "clear",
    MK_NATIVE_FN((args) => instance.clear(args[0]?.value)),
  );
  props.set(
    "setColor",
    MK_NATIVE_FN((args) => instance.setColor(args[0]?.value)),
  );
  props.set(
    "drawRect",
    MK_NATIVE_FN((args) =>
      instance.drawRect(
        args[0]?.value,
        args[1]?.value,
        args[2]?.value,
        args[3]?.value,
      ),
    ),
  );
  props.set(
    "strokeRect",
    MK_NATIVE_FN((args) =>
      instance.strokeRect(
        args[0]?.value,
        args[1]?.value,
        args[2]?.value,
        args[3]?.value,
      ),
    ),
  );
  props.set(
    "drawCircle",
    MK_NATIVE_FN((args) =>
      instance.drawCircle(args[0]?.value, args[1]?.value, args[2]?.value),
    ),
  );
  props.set(
    "drawText",
    MK_NATIVE_FN((args) =>
      instance.drawText(
        args[0]?.value,
        args[1]?.value,
        args[2]?.value,
        args[3]?.value,
      ),
    ),
  );
  props.set(
    "close",
    MK_NATIVE_FN(() => instance.close()),
  );

  return MK_OBJECT(props);
}
