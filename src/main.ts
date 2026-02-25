import type { Stmt } from "./frontend/ast";
import Parser from "./frontend/parser";
import Environment, { createGlobalEnv } from "./runtime/environment";
import { evaluate } from "./runtime/interpreter";
import { MakePrintable } from "./runtime/values";

main();

declare global {
  var lastStmt: Stmt | null;
  var evaluate: (astNode: Stmt, env: any) => any;
  var loadModule: (path: string) => Map<string, any>;
  var currentEnv: Environment | null;
}

global.evaluate = evaluate;

const moduleCache = new Map<string, Map<string, any>>();

async function main() {
  const args = Bun.argv.slice(2); // Remove 'bun' and 'script-name'

  if (args.length === 0) {
    // No arguments provided -> Start REPL
    await repl();
  } else {
    // Argument provided -> Execute file
    const filePath = args[0];
    await run(filePath);
  }
}

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";

global.loadModule = (path: string) => {
  let relativePath = path;
  if (!path.endsWith(".cursor") && !path.endsWith(".Cursor")) {
    relativePath += ".cursor";
  }

  // Resolve relative to current running file
  const currentEnv = (global as any).currentEnv;
  const currentFile = currentEnv?.currentFile || process.cwd();

  const fullPath = existsSync(relativePath)
    ? relativePath
    : join(dirname(currentFile), relativePath);

  if (moduleCache.has(fullPath)) {
    return moduleCache.get(fullPath)!;
  }

  // To prevent circular dependency issues during loading
  moduleCache.set(fullPath, new Map());

  const parser = new Parser();
  const env = createGlobalEnv();
  (env as any).currentFile = fullPath;

  const input = readFileSync(fullPath, "utf-8");
  const program = parser.produceAST(input, fullPath);

  // Switch global env context for the duration of evaluation
  const oldEnv = (global as any).currentEnv;
  (global as any).currentEnv = env;
  evaluate(program, env);
  (global as any).currentEnv = oldEnv;

  const exports = env.getExportedValues();
  moduleCache.set(fullPath, exports);
  return exports;
};

async function run(filePath: string = "./test/Main.Cursor") {
  const parser = new Parser();
  const env = createGlobalEnv();
  env.currentFile = join(process.cwd(), filePath);
  global.currentEnv = env;

  try {
    const input = await Bun.file(filePath).text();
    const program = parser.produceAST(input, filePath);

    const parts = filePath.split("\\");
    const filename = parts[parts.length - 1];
    const path = parts.slice(0, parts.length - 1).join("\\");

    const newFilePath = `${path}\\debug\\${filename}`;

    await Bun.write(
      `${newFilePath}.program.json`,
      JSON.stringify(program, null, 2),
    );

    const result = evaluate(program, env);
    await Bun.write(
      `${newFilePath}.result.json`,
      JSON.stringify(result, null, 2),
    );
  } catch (e) {
    console.error(
      "[Crashed]",
      e,
      `${filePath}:${lastStmt?.line ?? 0}:${lastStmt?.column ?? 0}`,
    );
    process.exit(1);
  }
}

async function repl() {
  const parser = new Parser();
  const env = createGlobalEnv();
  (global as any).currentEnv = env;

  console.log("Cursor++ [Repl v0.1]");

  while (true) {
    const input = prompt("> ");
    if (!input || input.includes("exit")) {
      process.exit(1);
      break;
    }

    try {
      const program = parser.produceAST(input, "<repl>");

      console.log(MakePrintable(evaluate(program, env)));
    } catch (e) {
      console.error("[Error]", e);
    }
  }
}
