import { terminal } from "terminal-kit";
import ConvertTOMK_Object from "./BaseLibConverter";
import { executeCallback, toNative } from "./Utils";

class _TerminalL {
  // Printing & Colors
  public print(text: any) {
    terminal(String(toNative(text)));
    return this;
  }

  public println(text: any) {
    terminal(String(toNative(text)) + "\n");
    return this;
  }

  public color(colorName: any) {
    const c = String(toNative(colorName));
    if ((terminal as any)[c]) {
      (terminal as any)[c]("");
    }
    return this;
  }

  public bgColor(colorName: any) {
    const c = String(toNative(colorName));
    const bgName = "bg" + c.charAt(0).toUpperCase() + c.slice(1);
    if ((terminal as any)[bgName]) {
      (terminal as any)[bgName]("");
    }
    return this;
  }

  public bold() {
    terminal.bold("");
    return this;
  }

  public italic() {
    terminal.italic("");
    return this;
  }

  public underline() {
    terminal.underline("");
    return this;
  }

  public inverse() {
    terminal.inverse("");
    return this;
  }

  public reset() {
    terminal.styleReset();
    return this;
  }

  // Cursor & Screen
  public moveTo(x: any, y: any) {
    terminal.moveTo(Number(toNative(x)), Number(toNative(y)));
    return this;
  }

  public move(x: any, y: any) {
    terminal.move(Number(toNative(x)), Number(toNative(y)));
    return this;
  }

  public up(n: any = 1) {
    terminal.up(Number(toNative(n)));
    return this;
  }

  public down(n: any = 1) {
    terminal.down(Number(toNative(n)));
    return this;
  }

  public left(n: any = 1) {
    terminal.left(Number(toNative(n)));
    return this;
  }

  public right(n: any = 1) {
    terminal.right(Number(toNative(n)));
    return this;
  }

  public clear() {
    terminal.clear();
    return this;
  }

  public eraseLine() {
    terminal.eraseLine();
    return this;
  }

  public eraseLineAfter() {
    terminal.eraseLineAfter();
    return this;
  }

  public eraseLineBefore() {
    terminal.eraseLineBefore();
    return this;
  }

  // Info
  public getWidth() {
    return terminal.width;
  }

  public getHeight() {
    return terminal.height;
  }

  // Input
  public grabInput(enable: any = true) {
    terminal.grabInput(toNative(enable));
    return this;
  }

  public onKey(callback: any) {
    terminal.on("key", async (name: string, matches: any, data: any) => {
      await executeCallback(callback, name, matches, data);
    });
    return this;
  }

  public onMouse(callback: any) {
    terminal.on("mouse", async (name: string, data: any) => {
      await executeCallback(callback, name, data);
    });
    return this;
  }

  // High-level Widgets
  public async inputField(options: any = {}) {
    return new Promise((resolve) => {
      terminal.inputField(toNative(options), (error, input) => {
        resolve(input);
      });
    });
  }

  public async yesOrNo(options: any = {}) {
    return new Promise((resolve) => {
      terminal.yesOrNo(toNative(options), (error, result) => {
        resolve(result);
      });
    });
  }

  public async gridMenu(items: any, options: any = {}) {
    const nativeItems = toNative(items);
    return new Promise((resolve) => {
      terminal.gridMenu(nativeItems, toNative(options), (error, response) => {
        resolve(response ? response.selectedText : null);
      });
    });
  }

  public async singleColumnMenu(items: any, options: any = {}) {
    const nativeItems = toNative(items);
    return new Promise((resolve, reject) => {
      if (!Array.isArray(nativeItems)) {
        return reject("singleColumnMenu items must be an array.");
      }
      terminal.singleColumnMenu(
        nativeItems,
        toNative(options),
        (error, response) => {
          if (error) reject(error);
          else resolve(response ? response.selectedText : null);
        },
      );
    });
  }

  public progressBar(options: any = {}) {
    const bar = terminal.progressBar(toNative(options));
    return {
      update: (progress: any) => bar.update(toNative(progress)),
      stop: () => bar.stop(),
    };
  }

  public fullscreen(enable: any = true) {
    terminal.fullscreen(toNative(enable));
    return this;
  }

  public processExit() {
    process.exit();
  }
}

export const TerminalLib = ConvertTOMK_Object(new _TerminalL());
