import type { Stmt } from "./frontend/ast";
import Parser from "./frontend/parser";
import Environment, { createGlobalEnv } from "./runtime/environment";
import { evaluate } from "./runtime/interpreter";
import { MakePrintable } from "./runtime/values";

main();

declare global {
  var lastStmt: Stmt | null;
  var evaluate: (astNode: Stmt, env: any) => Promise<any>;
  var loadModule: (path: string) => Promise<Map<string, any>>;
  var currentEnv: Environment | null;
}

global.evaluate = evaluate;

const moduleCache = new Map<string, Map<string, any>>();
import { handleCursorXCommand } from "./cursorx";

async function main() {
  // Check if we are running as a script (bun run src/main.ts) or as a compiled binary (cursorx.exe)
  const isCompiled = Bun.main.toLowerCase() === process.execPath.toLowerCase();

  const args = Bun.argv.slice(isCompiled ? 1 : 2);

  if (args.length === 0) {
    // No arguments provided -> Start REPL
    await repl();
  } else if (
    [
      "init",
      "add",
      "install",
      "i",
      "remove",
      "update",
      "version",
      "-v",
      "--version",
    ].includes(args[0] || "")
  ) {
    await handleCursorXCommand(args);
  } else {
    // Argument provided -> Execute file
    const filePath = args[0]!;
    await run(filePath);
  }
}

import { readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname, basename, resolve } from "path";

global.loadModule = async (path: string) => {
  let relativePath = path;
  const isRelative = path.startsWith("./") || path.startsWith("../");

  if (isRelative && !path.endsWith(".cursor") && !path.endsWith(".Cursor")) {
    relativePath += ".cursor";
  }

  // Resolve relative to current running file
  const currentEnv = global.currentEnv;
  const currentFile = currentEnv?.currentFile || process.cwd();

  let fullPath = "";

  if (isRelative) {
    fullPath = existsSync(relativePath)
      ? relativePath
      : join(dirname(currentFile), relativePath);
  } else {
    // Look in .cursorx
    const depPath = join(process.cwd(), ".cursorx", path);
    const configPath = join(depPath, "cursor.json");

    if (existsSync(configPath)) {
      const configContent = readFileSync(configPath, "utf-8");
      const config = JSON.parse(configContent);
      fullPath = join(depPath, config.main || "index.cursor");
    } else {
      // Fallback
      fullPath = join(depPath, "index.cursor");
      if (!existsSync(fullPath)) {
        fullPath = join(depPath, path + ".cursor");
      }
    }
  }

  if (!existsSync(fullPath)) {
    throw `Module not found: ${path} (resolved to ${fullPath})`;
  }

  if (moduleCache.has(fullPath)) {
    return moduleCache.get(fullPath)!;
  }

  // To prevent circular dependency issues during loading
  moduleCache.set(fullPath, new Map());

  const parser = new Parser();
  const env = createGlobalEnv();
  env.currentFile = fullPath;

  const input = readFileSync(fullPath, "utf-8");
  const program = parser.produceAST(input, fullPath);

  // Switch global env context for the duration of evaluation
  const oldEnv = (global as any).currentEnv;
  (global as any).currentEnv = env;
  (global as any).pendingPromises = [];
  await evaluate(program, env);
  (global as any).currentEnv = oldEnv;

  const exports = env.getExportedValues();
  moduleCache.set(fullPath, exports);
  return exports;
};

async function run(filePath: string = "./test/Main.Cursor") {
  const parser = new Parser();
  const env = createGlobalEnv();
  env.currentFile = resolve(filePath);
  global.currentEnv = env;
  (global as any).pendingPromises = [];

  try {
    const input = await Bun.file(filePath).text();
    const program = parser.produceAST(input, filePath);

    const filename = basename(filePath);
    const dir = dirname(filePath);
    const debugDir = join(dir, "debug");

    if (!existsSync(debugDir)) {
      mkdirSync(debugDir, { recursive: true });
    }

    const newFilePath = join(debugDir, filename);

    await Bun.write(
      `${newFilePath}.program.json`,
      JSON.stringify(program, null, 2),
    );

    const result = await evaluate(program, env);
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

      console.log(MakePrintable(await evaluate(program, env)));
    } catch (e) {
      console.error("[Error]", e);
    }
  }
}
