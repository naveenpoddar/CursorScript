import {
  MK_NATIVE_FN,
  MK_NULL,
  MK_STRING,
  MK_NUMBER,
  MK_BOOL,
  MK_OBJECT,
  type RuntimeValue,
  type FunctionValue,
  type ObjectValue,
} from "../runtime/values";
import ConvertTOMK_Object from "./BaseLibConverter";
import { requireString, requireNumber } from "./RequireFunctions";
import { resolve } from "path";
import Environment from "../runtime/environment";
import {
  serializeRuntimeValue,
  deserializeToRuntimeValue,
} from "../runtime/serialization";

let threadCounter = 0;
const activeThreads = new Map<number, _CursorThread>();

class _CursorThread {
  private worker: any;
  private onMessageCallback: any = null;
  private onErrorCallback: any = null;
  public id: number;
  public name: string;
  public status: string = "running";
  public path: string;

  constructor(filePath: string, smol: boolean, name?: string) {
    this.id = ++threadCounter;
    this.name = name || `thread-${this.id}`;
    this.path = filePath;
    const workerPath = resolve("src/runtime/worker_bridge.ts");

    // @ts-ignore
    this.worker = new Worker(workerPath, {
      smol: smol,
    });

    activeThreads.set(this.id, this);

    this.worker.postMessage({ type: "init", filePath, threadId: this.id });

    this.worker.onmessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.type === "message" && this.onMessageCallback) {
        const runtimeData = deserializeToRuntimeValue(msg.data);
        this.executeCallback(this.onMessageCallback, [runtimeData]);
      } else if (msg.type === "log") {
        console.log(`[Thread-${this.id}]`, msg.data);
      } else if (msg.type === "done") {
        this.status = "finished";
      } else if (msg.type === "error") {
        this.status = "error";
        console.error(`[Thread-${this.id} Error]`, msg.error);
        if (this.onErrorCallback) {
          this.executeCallback(this.onErrorCallback, [MK_STRING(msg.error)]);
        }
      }
    };

    this.worker.onerror = (e: any) => {
      this.status = "error";
      console.error(`[Thread-${this.id} Critical Error]`, e.message);
    };
  }

  public send(data: any) {
    // data here might be a RuntimeValue if called from CursorScript
    const serializedData = serializeRuntimeValue(data);
    this.worker.postMessage({ type: "message", data: serializedData });
  }

  public onMessage(callback: any) {
    this.onMessageCallback = callback;
    return this; // Chainable
  }

  public onError(callback: any) {
    this.onErrorCallback = callback;
    return this; // Chainable
  }

  public isAlive() {
    return this.status === "running";
  }

  public getStatus() {
    return MK_STRING(this.status);
  }

  public terminate() {
    this.status = "terminated";
    this.worker.terminate();
    activeThreads.delete(this.id);
  }

  public getInfo() {
    const info = new Map<string, RuntimeValue>();
    info.set("id", MK_NUMBER(this.id));
    info.set("name", MK_STRING(this.name));
    info.set("status", MK_STRING(this.status));
    info.set("path", MK_STRING(this.path));
    return MK_OBJECT(info);
  }

  private executeCallback(func: any, args: any[] = []) {
    if (typeof func === "function") {
      // If it's a wrapped function from BaseLibConverter
      func(...args);
    } else if (func && func.type === "function") {
      // Internal FunctionValue
      const fn = func as FunctionValue;
      const scope = new Environment(fn.declarationEnv);

      // Map args
      for (let i = 0; i < fn.parameters.length; i++) {
        scope.declareVar(fn.parameters[i]!, args[i] || MK_NULL(), false);
      }

      for (const stmt of fn.body) {
        global.evaluate(stmt, scope);
      }
    }
  }
}

class _ThreadLib {
  public spawn(filePath: any, options: any = null) {
    const path = requireString(filePath);
    let smol = false;
    let name = "";

    if (options && options.type === "object") {
      const smolVal = (options as ObjectValue).properties.get("smol");
      if (smolVal && smolVal.type === "boolean") smol = (smolVal as any).value;

      const nameVal = (options as ObjectValue).properties.get("name");
      if (nameVal && nameVal.type === "string") name = (nameVal as any).value;
    } else if (options && options.type === "boolean") {
      smol = options.value;
    }

    return ConvertTOMK_Object(new _CursorThread(path, smol, name));
  }

  public spawnSmol(filePath: any) {
    return this.spawn(filePath, MK_BOOL(true));
  }

  public sleep(ms: any) {
    const m = requireNumber(ms);
    const start = Date.now();
    // Synchronous sleep in JS (busy wait) - use carefully!
    // In workers this is fine as it only blocks the worker.
    while (Date.now() - start < m) {
      // Wait
    }
    return MK_NULL();
  }

  public terminateAll() {
    for (const thread of activeThreads.values()) {
      thread.terminate();
    }
    activeThreads.clear();
    return MK_NULL();
  }

  public list() {
    const threads = [];
    for (const thread of activeThreads.values()) {
      threads.push(thread.getInfo());
    }
    return {
      type: "array",
      elements: threads,
    } as any;
  }

  public joinAll() {
    // joinAll is also problematic in JS if it blocks the event loop.
    // Removing it to prevent deadlocks.
    return MK_NULL();
  }
}

export const ThreadL = ConvertTOMK_Object(new _ThreadLib());
