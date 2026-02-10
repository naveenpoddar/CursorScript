import Parser from "./frontend/parser";
import { createGlobalEnv } from "./runtime/environment";
import { evaluate } from "./runtime/interpreter";

main();

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

async function run(filePath: string = "./test/Main.Cursor") {
  const parser = new Parser();
  const env = createGlobalEnv();

  try {
    const input = await Bun.file(filePath).text();
    const program = parser.produceAST(input);

    await Bun.write(
      `${filePath}.program.json`,
      JSON.stringify(program, null, 2),
    );

    const result = evaluate(program, env);
    await Bun.write(`${filePath}.result.json`, JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(e, filePath);
    process.exit(1);
  }
}

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
