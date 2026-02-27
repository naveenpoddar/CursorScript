import chalk from "chalk";
import prompts from "prompts";
import ConvertTOMK_Object from "./BaseLibConverter";
import { executeCallback, toNative } from "./Utils";
import * as readline from "readline";

class _TerminalL {
  private _currentStyle: (text: string) => string = (text) => text;

  constructor() {
    // No initialization needed for chalk/prompts
  }

  // Printing & Colors
  public print(text: any) {
    process.stdout.write(this._currentStyle(String(toNative(text))));
    return this;
  }

  public println(text: any) {
    process.stdout.write(this._currentStyle(String(toNative(text)) + "\n"));
    return this;
  }

  public color(colorName: any) {
    const c = String(toNative(colorName));
    const style = (chalk as any)[c];
    if (typeof style === "function") {
      const prev = this._currentStyle;
      this._currentStyle = (text: string) => prev(style(text));
    }
    return this;
  }

  public bgColor(colorName: any) {
    const c = String(toNative(colorName));
    const bgName = "bg" + c.charAt(0).toUpperCase() + c.slice(1);
    const style = (chalk as any)[bgName];
    if (typeof style === "function") {
      const prev = this._currentStyle;
      this._currentStyle = (text: string) => prev(style(text));
    }
    return this;
  }

  public bold() {
    const prev = this._currentStyle;
    this._currentStyle = (text: string) => prev(chalk.bold(text));
    return this;
  }

  public italic() {
    const prev = this._currentStyle;
    this._currentStyle = (text: string) => prev(chalk.italic(text));
    return this;
  }

  public underline() {
    const prev = this._currentStyle;
    this._currentStyle = (text: string) => prev(chalk.underline(text));
    return this;
  }

  public inverse() {
    const prev = this._currentStyle;
    this._currentStyle = (text: string) => prev(chalk.inverse(text));
    return this;
  }

  public reset() {
    this._currentStyle = (text: string) => text;
    process.stdout.write("\x1b[0m");
    return this;
  }

  // Cursor & Screen
  public moveTo(x: any, y: any) {
    process.stdout.write(`\x1b[${Number(toNative(y))};${Number(toNative(x))}H`);
    return this;
  }

  public move(x: any, y: any) {
    const nx = Number(toNative(x));
    const ny = Number(toNative(y));
    if (nx > 0) process.stdout.write(`\x1b[${nx}C`);
    else if (nx < 0) process.stdout.write(`\x1b[${-nx}D`);
    if (ny > 0) process.stdout.write(`\x1b[${ny}B`);
    else if (ny < 0) process.stdout.write(`\x1b[${-ny}A`);
    return this;
  }

  public up(n: any = 1) {
    process.stdout.write(`\x1b[${Number(toNative(n))}A`);
    return this;
  }

  public down(n: any = 1) {
    process.stdout.write(`\x1b[${Number(toNative(n))}B`);
    return this;
  }

  public left(n: any = 1) {
    process.stdout.write(`\x1b[${Number(toNative(n))}D`);
    return this;
  }

  public right(n: any = 1) {
    process.stdout.write(`\x1b[${Number(toNative(n))}C`);
    return this;
  }

  public clear() {
    process.stdout.write("\x1b[2J\x1b[H");
    return this;
  }

  public eraseLine() {
    process.stdout.write("\x1b[2K");
    return this;
  }

  public eraseLineAfter() {
    process.stdout.write("\x1b[0K");
    return this;
  }

  public eraseLineBefore() {
    process.stdout.write("\x1b[1K");
    return this;
  }

  // Info
  public getWidth() {
    return process.stdout.columns || 80;
  }

  public getHeight() {
    return process.stdout.rows || 24;
  }

  // Input
  public grabInput(enable: any = true) {
    const isEnabled = toNative(enable);
    if (process.stdin.isTTY) {
      if (isEnabled) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        readline.emitKeypressEvents(process.stdin);
      } else {
        process.stdin.setRawMode(false);
        process.stdin.pause();
      }
    }
    return this;
  }

  public onKey(callback: any) {
    process.stdin.on("keypress", async (str, key) => {
      if (!key) return;
      let name = key.name || str;
      if (key.ctrl) {
        name = "CTRL_" + (key.name ? key.name.toUpperCase() : "");
      }
      if (key.name === "return") name = "ENTER";
      if (key.name === "escape") name = "ESCAPE";
      if (key.name === "backspace") name = "BACKSPACE";
      if (key.name === "tab") name = "TAB";

      await executeCallback(callback, name, [name], key);
    });
    return this;
  }

  public onMouse(callback: any) {
    return this;
  }

  // High-level Widgets
  public async inputField(options: any = {}) {
    const opt = toNative(options);
    const response = await prompts({
      type: "text",
      name: "value",
      message: opt.message || opt.title || "Input:",
      initial: opt.default || "",
    });
    return response.value;
  }

  public async yesOrNo(options: any = {}) {
    const opt = toNative(options);
    const response = await prompts({
      type: "confirm",
      name: "value",
      message:
        typeof opt === "string"
          ? opt
          : opt.message || opt.title || "Yes or No?",
      initial: opt.default !== undefined ? opt.default : true,
    });
    return response.value;
  }

  public async gridMenu(items: any, options: any = {}) {
    const nativeItems = toNative(items);
    const opt = toNative(options);
    const response = await prompts({
      type: "select",
      name: "value",
      message: opt.message || opt.title || "Select an item",
      choices: nativeItems.map((item: any) => ({
        title: String(item),
        value: item,
      })),
    });
    return response.value;
  }

  public async singleColumnMenu(items: any, options: any = {}) {
    const nativeItems = toNative(items);
    const opt = toNative(options);
    if (!Array.isArray(nativeItems)) {
      throw "singleColumnMenu items must be an array.";
    }
    const response = await prompts({
      type: "select",
      name: "value",
      message: opt.message || opt.title || "Select an item",
      choices: nativeItems.map((item: any) => ({
        title: String(item),
        value: item,
      })),
    });
    return response.value;
  }

  public progressBar(options: any = {}) {
    const opt = toNative(options);
    const width = opt.width || 40;
    const title = opt.title || "";

    const render = (progress: number) => {
      const filledWidth = Math.min(
        width,
        Math.max(0, Math.round(width * progress)),
      );
      const emptyWidth = width - filledWidth;
      const bar = "█".repeat(filledWidth) + "░".repeat(emptyWidth);
      const percent = Math.round(progress * 100);
      process.stdout.write(`\r${title} [${bar}] ${percent}%`);
    };

    render(0);

    return {
      update: (progress: any) => {
        render(toNative(progress));
      },
      stop: () => {
        process.stdout.write("\n");
      },
    };
  }

  public fullscreen(enable: any = true) {
    if (toNative(enable)) {
      process.stdout.write("\x1b[?1049h");
    } else {
      process.stdout.write("\x1b[?1049l");
    }
    return this;
  }

  public processExit() {
    process.exit();
  }
}

export const TerminalLib = ConvertTOMK_Object(new _TerminalL());
