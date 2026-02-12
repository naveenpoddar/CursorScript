import { $ } from "bun";
import pkg from "./package.json";
import { existsSync } from "node:fs";

// 1. Configuration
const entryPoint = "./src/main.ts";
const outDir = "./dist";
const appName = "cursorscript";
const version = pkg.version;

// 2. Define targets and their corresponding native libs
const targets = [
  { id: "bun-linux-x64", lib: "libraylib.so" },
  { id: "bun-linux-arm64", lib: "libraylib.so" },
  { id: "bun-darwin-x64", lib: "libraylib.dylib" },
  { id: "bun-darwin-arm64", lib: "libraylib.dylib" },
  { id: "bun-windows-x64-baseline", lib: "libraylib.dll" },
];

// 3. Clean up old builds
console.log(`\n🚀 Building ${appName} v${version}...`);
await $`rm -rf ${outDir} && mkdir -p ${outDir}`;

// 4. Run the build loop
for (const target of targets) {
  const isWindows = target.id.includes("windows");
  const extension = isWindows ? ".exe" : "";
  const baseName = `${appName}-${target.id.replace("bun-", "")}`;
  const binName = `${baseName}${extension}`;
  const targetFolder = `${outDir}/${baseName}`;
  const binPath = `${targetFolder}/${binName}`;

  process.stdout.write(`📦 Target: ${target.id.padEnd(25)} ... `);

  try {
    // Create a subfolder for this specific OS build
    await $`mkdir -p ${targetFolder}`;

    // Build the executable
    await $`bun build ${entryPoint} \
      --compile \
      --target=${target.id} \
      --outfile=${binPath}`.quiet();

    // Copy the specific native library for this OS into the folder
    // Note: This assumes your lib files are named exactly as discussed in the root /lib folder
    const libSource = `./lib/${target.lib}`;
    if (existsSync(libSource)) {
      await $`cp ${libSource} ${targetFolder}/`;
    } else {
      console.warn(`⚠️  Warning: ${libSource} not found, skipping lib copy.`);
    }

    console.log("✅ Done");
  } catch (error) {
    console.log("❌ Failed");
    console.error(error);
  }
}

console.log(`\n✨ All builds complete! Check the ${outDir} folder.`);
console.log(
  `👉 Note: Distribute the FOLDERS, as the executable needs the library file next to it.`,
);
