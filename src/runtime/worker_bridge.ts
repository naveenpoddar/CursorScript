import Parser from "../frontend/parser";
import { createGlobalEnv, default as Environment } from "./environment";
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

const messageQueue: any[] = [];
let isInitialized = false;
let workerEnv: any = null;

worker.onmessage = async (event: MessageEvent) => {
  const msg = event.data;
  if (msg.type === "init") {
    await runWorker(msg.filePath, msg.threadId);
    isInitialized = true;
    // Process queued messages
    while (messageQueue.length > 0) {
      const qMsg = messageQueue.shift();
      await handleIncomingMessage(qMsg);
    }
  } else if (msg.type === "message") {
    if (!isInitialized) {
      messageQueue.push(msg);
    } else {
      await handleIncomingMessage(msg);
    }
  }
};

async function handleIncomingMessage(msg: any) {
  if (!workerEnv) return;
  const onMessageCallback = workerEnv.lookupVar("onMessageCallback");
  if (
    onMessageCallback &&
    (onMessageCallback.type === "function" ||
      onMessageCallback.type === "native-fn")
  ) {
    const runtimeData = deserializeToRuntimeValue(msg.data);
    await executeCallback(onMessageCallback, [runtimeData], workerEnv);
  }
}

async function runWorker(filePath: string, threadId: number) {
  try {
    const parser = new Parser();
    const env = createGlobalEnv();
    workerEnv = env;
    env.currentFile = resolve(filePath);
    global.currentEnv = env;

    // Helper for high-level info
    env.declareVar("id", MK_NUMBER(threadId), true);
    env.declareVar("onMessageCallback", MK_NULL(), false);
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
      env.assignVar("onMessageCallback", callback!);
      return MK_NULL();
    });

    if (ThreadObj && ThreadObj.type === "object") {
      ThreadObj.properties.set("send", sendMessageFn);
      ThreadObj.properties.set("onMessage", setOnMessageFn);
    }

    env.declareVar("send", sendMessageFn, true);
    env.declareVar("onMessage", setOnMessageFn, true);

    if (!existsSync(filePath)) {
      worker.postMessage({
        type: "error",
        error: `File not found: ${filePath}`,
      });
      return;
    }

    const input = readFileSync(filePath, "utf-8");
    const program = parser.produceAST(input, filePath);

    await evaluate(program, env);
    worker.postMessage({ type: "done" });
  } catch (e) {
    worker.postMessage({ type: "error", error: String(e) });
  }
}

async function executeCallback(func: any, args: any[] = [], parentEnv: any) {
  if (func.type === "native-fn") {
    return await func.call(args, parentEnv);
  } else if (func.type === "function") {
    const fn = func as FunctionValue;
    const scope = new Environment(fn.declarationEnv, fn.async);

    for (let i = 0; i < fn.parameters.length; i++) {
      scope.declareVar(fn.parameters[i]!, args[i] || MK_NULL(), false);
    }

    for (const stmt of fn.body) {
      await global.evaluate(stmt, scope);
    }
  }
}
