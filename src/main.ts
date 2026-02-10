import Parser from "./frontend/parser";
import { createGlobalEnv } from "./runtime/environment";
import { evaluate } from "./runtime/interpreter";
import {
  MK_BOOL,
  MK_NULL,
  MK_NUMBER,
  type NumberValue,
} from "./runtime/values";

// repl();

async function run() {
  const parser = new Parser();
  const env = createGlobalEnv();

  const input = await Bun.file("./test/Main.Cursor").text();
  const program = parser.produceAST(input);

  await Bun.write(
    "./test/Main.Cursor.program.json",
    JSON.stringify(program, null, 2),
  );

  const result = evaluate(program, env);
  await Bun.write(
    "./test/Main.Cursor.result.json",
    JSON.stringify(result, null, 2),
  );
}

run();

async function repl() {
  const parser = new Parser();
  const env = createGlobalEnv();

  console.log("Cursor++ [Repl v0.1]");

  while (true) {
    const input = prompt("> ");
    if (!input || input.includes("exit")) {
      process.exit(1);
      break;
    }

    const program = parser.produceAST(input);
    console.dir(program, { depth: null });

    const result = evaluate(program, env);
    console.log(result);
  }
}
