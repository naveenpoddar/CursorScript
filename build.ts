import { $ } from "bun";
import pkg from "./package.json";
import { existsSync } from "node:fs";
import { NtExecutable, NtExecutableResource, Resource } from "resedit";

// 1. Configuration
const entryPoint = "./src/main.ts";
const outDir = "./dist";
const appName = "cursorscript";
const version = pkg.version;

const ALL_TARGETS: Bun.Build.CompileTarget[] = [
  "bun-linux-x64",
  "bun-linux-arm64",
  "bun-darwin-x64",
  "bun-darwin-arm64",
  "bun-windows-x64-baseline",
];

const targetArg = process.argv.find((arg) => arg.startsWith("bun-"));
const targets = (
  targetArg ? [targetArg] : ALL_TARGETS
) as Bun.Build.CompileTarget[];

console.log(`\n🚀 Bundling ${appName} v${version}...`);
await $`rm -rf ${outDir} && mkdir -p ${outDir}`;

const tempBundle = `${outDir}/_temp_bundle.js`;

// 2. Bundling Step (The "Bundler-based" part)
// This prepares the code, handles imports, and tree-shakes.
const buildResult = await Bun.build({
  entrypoints: [entryPoint],
  target: "bun", // We bundle for the bun runtime
  minify: true,
  external: [],
  packages: "bundle",
  naming: "_temp_bundle.js",
  sourcemap: "external",
  outdir: outDir,
});

if (!buildResult.success) {
  console.error("Build failed:", buildResult.logs);
  process.exit(1);
}

for (const targetId of targets) {
  const isWindows = targetId.includes("windows");
  const extension = isWindows ? ".exe" : "";
  const baseName = `${appName}-${targetId.replace("bun-", "")}`;
  const targetFolder = `${outDir}/${baseName}`;
  const binPath = `${targetFolder}/cursorx${extension}`;

  process.stdout.write(`📦 Target: ${targetId.padEnd(25)} ... `);

  try {
    // 3. Compilation & Packaging
    await $`mkdir -p ${targetFolder}`;

    // Compile the bundled output into a single executable
    if (isWindows) {
      console.log(`🔧 Patching Windows metadata for ${binPath}...`);
      // await rcedit(binPath, {
      //   "product-version": version,
      //   "version-string": {
      //     CompanyName: "CursorScript",
      //     FileDescription: "CursorScript Executable",
      //     LegalCopyright: "© 2024 CursorScript. All rights reserved.",
      //     OriginalFilename: "cursorx.exe",
      //     ProductName: "CursorScript",
      //   },
      //   "file-version": version,
      //   icon: "./icon.ico",
      // });

      await Bun.build({
        entrypoints: [tempBundle],
        compile: {
          outfile: binPath,
          target: targetId,
          windows: {
            icon: "./icon.ico",
            // Additional Windows metadata:
            title: "CursorScript Executable",
            publisher: "NaveenPoddar",
            version: version,
            description: "CursorScript Executable",
            copyright: "© 2024 CursorScript. All rights reserved.",
          },
        },
      });
    } else {
      await $`bun build ${tempBundle} --compile --target=${targetId} --outfile=${binPath}`.quiet();
    }

    // 4. Asset Management
    const libSource = `./lib`;
    if (existsSync(libSource)) {
      await $`cp -r ${libSource} ${targetFolder}/`;
    }

    // 5. Compression
    await $`cd ${outDir} && zip -r -9 ${baseName}.zip ${baseName}`.quiet();
    await $`rm -rf ${targetFolder}`;

    console.log("✅ Done");
  } catch (error) {
    console.log("❌ Failed");
    console.error(error);
  }
}

console.log(`\n✨ All builds compressed in ${outDir}`);
