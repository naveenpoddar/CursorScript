import { $ } from "bun";
import pkg from "./package.json";

// 1. Configuration
const entryPoint = "./src/main.ts"; // Change this to your compiler's entry
const outDir = "./dist";
const appName = "cursorscript";
const version = pkg.version;

// 2. Define our targets (OS + Architecture)
const targets = [
  "bun-linux-x64",
  "bun-linux-arm64",
  "bun-darwin-x64",
  "bun-darwin-arm64",
  "bun-windows-x64-baseline",
];

// 3. Clean up old builds
console.log(`\n🚀 Building ${appName} v${version}...`);
await $`rm -rf ${outDir} && mkdir -p ${outDir}`;

// 4. Run the build loop
for (const target of targets) {
  const isWindows = target.includes("windows");
  const extension = isWindows ? ".exe" : "";
  const fileName = `${appName}-${target.replace("bun-", "")}${extension}`;
  const path = `${outDir}/${fileName}`;

  process.stdout.write(`📦 Target: ${target.padEnd(20)} ... `);

  try {
    await $`bun build ${entryPoint} \
      --compile \
      --minify \
      --bytecode \
      --target=${target} \
      --outfile=${path}`.quiet();

    console.log("✅ Done");
  } catch (error) {
    console.log("❌ Failed");
    console.error(error);
  }
}

console.log(`\n✨ All builds complete! Check the ${outDir} folder.\n`);
