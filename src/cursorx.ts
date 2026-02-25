import { existsSync, mkdirSync, rmSync } from "fs";
import { join, basename } from "path";

import pkg from "../package.json";

const CURSOR_JSON = "cursor.json";
const DEP_DIR = ".cursorx";
const CURRENT_VERSION = pkg.version;

interface CursorConfig {
  name: string;
  version: string;
  main: string;
  packages: Record<string, string>;
}

async function init() {
  console.log("Initializing CursorScript project...");

  // Use defaults for now since prompt() is problematic in some environments
  const name = basename(process.cwd()) || "my-project";
  const version = "1.0.0";
  const main = "src/main.cursor";

  const config: CursorConfig = {
    name,
    version,
    main,
    packages: {},
  };

  await Bun.write(CURSOR_JSON, JSON.stringify(config, null, 2));

  // Create .gitignore
  const gitignore = ".gitignore";
  let gitignoreContent = "";
  if (existsSync(gitignore)) {
    gitignoreContent = await Bun.file(gitignore).text();
    if (!gitignoreContent.includes(DEP_DIR)) {
      gitignoreContent += `\n${DEP_DIR}\n`;
    }
  } else {
    gitignoreContent = `${DEP_DIR}\n`;
  }
  await Bun.write(gitignore, gitignoreContent);

  console.log(`✅ Created ${CURSOR_JSON} and updated .gitignore`);
}

async function downloadAndExtract(url: string, targetDir: string) {
  const response = await fetch(url);
  if (!response.ok) return false;

  const tempFile = join(DEP_DIR, "temp.tar.gz");
  const arrayBuffer = await response.arrayBuffer();
  await Bun.write(tempFile, arrayBuffer);

  if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

  try {
    // Windows 10/11 and Unix have 'tar'
    const proc = Bun.spawn(
      ["tar", "-xzf", tempFile, "-C", targetDir, "--strip-components=1"],
      {
        stdout: "inherit",
        stderr: "inherit",
      },
    );
    await proc.exited;
    rmSync(tempFile);
    return true;
  } catch (e) {
    console.error(
      "Extraction failed. Ensure 'tar' is installed on your system.",
    );
    if (existsSync(tempFile)) rmSync(tempFile);
    return false;
  }
}

async function verifyDependency(targetDir: string, slug: string) {
  const depConfigPath = join(targetDir, CURSOR_JSON);
  if (!existsSync(depConfigPath)) {
    console.warn(
      `\n⚠️  Warning: The module '${slug}' does not contain a ${CURSOR_JSON} file. It might not be a valid CursorScript dependency.\n`,
    );
    return;
  }

  try {
    const config: any = await Bun.file(depConfigPath).json();
    // Basic heuristic: check for name and a .cursor main file
    if (!config.name || (config.main && !config.main.endsWith(".cursor"))) {
      console.warn(
        `\n⚠️  Warning: The module '${slug}' has a ${CURSOR_JSON} but it does not appear to be a standard CursorScript dependency.\n`,
      );
    }
  } catch (e) {
    console.warn(
      `\n⚠️  Warning: Failed to parse ${CURSOR_JSON} in module '${slug}'.\n`,
    );
  }
}

async function addModule(repoUrl: string) {
  if (!repoUrl) {
    console.error("Usage: cursorx add <repository-url>");
    return;
  }

  if (!existsSync(CURSOR_JSON)) {
    console.error("No cursor.json found. Run 'cursorx init' first.");
    return;
  }

  const config: CursorConfig = await Bun.file(CURSOR_JSON).json();
  if (!config.name || (config.main && !config.main.endsWith(".cursor"))) {
    console.warn(
      `\n⚠️  Warning: The local ${CURSOR_JSON} does not appear to be a standard CursorScript project.\n`,
    );
  }
  const slug = repoUrl.split("/").pop()?.replace(".git", "") || "unknown";
  console.log(`Installing module '${slug}' from ${repoUrl}...`);

  const targetDir = join(DEP_DIR, slug);
  if (!existsSync(DEP_DIR)) mkdirSync(DEP_DIR);
  if (existsSync(targetDir))
    rmSync(targetDir, { recursive: true, force: true });

  const baseUrl = repoUrl.replace(".git", "").replace(/\/$/, "");

  // Try 'main' then 'master'
  let success = await downloadAndExtract(`${baseUrl}/tarball/main`, targetDir);
  if (!success) {
    success = await downloadAndExtract(`${baseUrl}/tarball/master`, targetDir);
  }

  if (success) {
    await verifyDependency(targetDir, slug);
    config.packages[slug] = repoUrl;
    await Bun.write(CURSOR_JSON, JSON.stringify(config, null, 2));
    console.log(`✅ Module '${slug}' installed to ${DEP_DIR}/${slug}`);
  } else {
    console.error(
      `❌ Failed to download module. Check the URL or your internet connection.`,
    );
  }
}

async function installAll() {
  if (!existsSync(CURSOR_JSON)) {
    console.error("No cursor.json found.");
    return;
  }

  const config: CursorConfig = await Bun.file(CURSOR_JSON).json();
  if (!config.name || (config.main && !config.main.endsWith(".cursor"))) {
    console.warn(
      `\n⚠️  Warning: The local ${CURSOR_JSON} does not appear to be a standard CursorScript project.\n`,
    );
  }
  const pkgs = config.packages || {};

  if (Object.keys(pkgs).length === 0) {
    console.log("No packages to install.");
    return;
  }

  if (!existsSync(DEP_DIR)) mkdirSync(DEP_DIR);

  for (const [slug, url] of Object.entries(pkgs)) {
    console.log(`Installing ${slug}...`);
    const targetDir = join(DEP_DIR, slug);
    if (existsSync(targetDir))
      rmSync(targetDir, { recursive: true, force: true });

    const baseUrl = url.replace(".git", "").replace(/\/$/, "");
    let success = await downloadAndExtract(
      `${baseUrl}/tarball/main`,
      targetDir,
    );
    if (!success) {
      success = await downloadAndExtract(
        `${baseUrl}/tarball/master`,
        targetDir,
      );
    }

    if (success) {
      await verifyDependency(targetDir, slug);
    }
  }
  console.log("✅ All packages installed.");
}

async function removeModule(slug: string) {
  if (!slug) {
    console.error("Usage: cursorx remove <slug>");
    return;
  }

  if (!existsSync(CURSOR_JSON)) return;

  const config: CursorConfig = await Bun.file(CURSOR_JSON).json();
  if (config.packages[slug]) {
    delete config.packages[slug];
    await Bun.write(CURSOR_JSON, JSON.stringify(config, null, 2));

    const targetDir = join(DEP_DIR, slug);
    if (existsSync(targetDir)) {
      rmSync(targetDir, { recursive: true, force: true });
    }
    console.log(`✅ Module '${slug}' removed.`);
  } else {
    console.log(`Module '${slug}' not found in cursor.json`);
  }
}

async function checkForUpdates() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/naveenpoddar/cursorscript/releases/latest",
      {
        headers: { "User-Agent": "CursorX-CLI" },
      },
    );
    if (!response.ok) return;

    const release: any = await response.json();
    const latestVersion = release.tag_name.replace(/^v/, "");

    if (latestVersion !== CURRENT_VERSION) {
      console.warn(
        `\n🚀 New version available: ${latestVersion} (current: ${CURRENT_VERSION})`,
      );
      console.warn(`👉 Run 'cursorx update' to install the latest version.\n`);
    }
  } catch (e) {
    // Silently fail update check
  }
}

async function performUpdate() {
  const isWindows = process.platform === "win32";
  console.log(`🚀 Updating CursorScript...`);

  const cmd = isWindows
    ? [
        "powershell",
        "-Command",
        "irm https://raw.githubusercontent.com/naveenpoddar/cursorscript/main/install.ps1 | iex",
      ]
    : [
        "curl -fsSL https://raw.githubusercontent.com/naveenpoddar/cursorscript/main/install.sh | bash",
      ];

  try {
    const proc = Bun.spawn(isWindows ? cmd : ["bash", "-c", cmd[0]!], {
      stdout: "inherit",
      stderr: "inherit",
    });
    await proc.exited;
  } catch (e) {
    console.error("❌ Update failed:", e);
  }
}

export async function handleCursorXCommand(args: string[]) {
  const command = args[0];

  // Background update check (fire and forget, or wait briefly)
  if (command !== "update") {
    checkForUpdates(); // Non-blocking
  }

  switch (command) {
    case "init":
      await init();
      break;
    case "add":
    case "i":
    case "install":
      if (args[1]) {
        await addModule(args[1]);
      } else {
        await installAll();
      }
      break;
    case "remove":
      await removeModule(args[1]!);
      break;
    case "update":
      await performUpdate();
      break;
    case "version":
    case "-v":
    case "--version":
      console.log(`CursorX v${CURRENT_VERSION}`);
      break;
    default:
      console.log("CursorScript Package Manager");
      console.log("Usage:");
      console.log("  cursorx init           - Initialize project");
      console.log("  cursorx add <repo>     - Add a dependency");
      console.log(
        "  cursorx install        - Install all dependencies from cursor.json",
      );
      console.log("  cursorx remove <slug>  - Remove a dependency");
      console.log(
        "  cursorx update         - Update CursorScript to the latest version",
      );
      console.log("  cursorx version        - Show version information");
      break;
  }
}

// Add entry point for direct execution
if (import.meta.main) {
  handleCursorXCommand(process.argv.slice(2));
}
