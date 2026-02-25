import Parser from "../frontend/parser";
import { createGlobalEnv } from "./environment";
import { evaluate } from "./interpreter";
import {
  MK_NATIVE_FN,
  MK_NULL,
  MK_STRING,
  type RuntimeValue,
  type NativeFnValue,
  type StringValue,
  type FunctionValue,
  MK_NUMBER,
} from "./values";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import {
  serializeRuntimeValue,
  deserializeToRuntimeValue,
} from "./serialization";

// Polyfill globals
// declare global {
//   var lastStmt: any;
//   var evaluate: any;
//   var loadModule: any;
//   var currentEnv: any;
// }

import { evaluate as interpreterEvaluate } from "./interpreter";
global.evaluate = interpreterEvaluate;

// @ts-ignore
const worker = self as any;

worker.onmessage = async (event: MessageEvent) => {
  const msg = event.data;
  if (msg.type === "init") {
    await runWorker(msg.filePath, msg.threadId);
  }
};

async function runWorker(filePath: string, threadId: number) {
  try {
    const parser = new Parser();
    const env = createGlobalEnv();
    env.currentFile = resolve(filePath);
    global.currentEnv = env;

    // Helper for high-level info
    env.declareVar("id", MK_NUMBER(threadId), true);
    const ThreadObj = env.lookupVar("Thread") as any;

    const sendMessageFn = MK_NATIVE_FN((args) => {
      const data = args[0] as RuntimeValue;
      worker.postMessage({
        type: "message",
        data: serializeRuntimeValue(data),
      });
      return MK_NULL();
    });

    const setOnMessageFn = MK_NATIVE_FN((args) => {
      const callback = args[0];
      env.declareVar("onMessageCallback", callback!, false);
      return MK_NULL();
    });

    if (ThreadObj && ThreadObj.type === "object") {
      ThreadObj.properties.set("send", sendMessageFn);
      ThreadObj.properties.set("onMessage", setOnMessageFn);
    }

    env.declareVar("send", sendMessageFn, true);
    env.declareVar("onMessage", setOnMessageFn, true);

    // Handle messages coming TO the worker
    worker.onmessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.type === "message") {
        const onMessageCallback = env.lookupVar("onMessageCallback");
        if (
          onMessageCallback &&
          (onMessageCallback.type === "function" ||
            onMessageCallback.type === "native-fn")
        ) {
          const runtimeData = deserializeToRuntimeValue(msg.data);
          executeCallback(onMessageCallback, [runtimeData], env);
        }
      }
    };

    if (!existsSync(filePath)) {
      worker.postMessage({
        type: "error",
        error: `File not found: ${filePath}`,
      });
      return;
    }

    const input = readFileSync(filePath, "utf-8");
    const program = parser.produceAST(input, filePath);

    evaluate(program, env);
    worker.postMessage({ type: "done" });
  } catch (e) {
    worker.postMessage({ type: "error", error: String(e) });
  }
}

function executeCallback(func: any, args: any[] = [], parentEnv: any) {
  import("./environment").then(({ default: Environment }) => {
    if (func.type === "native-fn") {
      func.call(args, parentEnv);
    } else if (func.type === "function") {
      const fn = func as FunctionValue;
      const scope = new Environment(fn.declarationEnv);

      for (let i = 0; i < fn.parameters.length; i++) {
        scope.declareVar(fn.parameters[i]!, args[i] || MK_NULL(), false);
      }

      for (const stmt of fn.body) {
        global.evaluate(stmt, scope);
      }
    }
  });
}
