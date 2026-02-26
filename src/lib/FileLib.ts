import ConvertTOMK_Object from "./BaseLibConverter";
import * as fs from "node:fs";

class FileL {
  async readAsync(path: string) {
    try {
      return await fs.promises.readFile(path, "utf-8");
    } catch (e: any) {
      throw `Failed to read file: ${e.message}`;
    }
  }

  async writeAsync(path: string, data: string) {
    try {
      await fs.promises.writeFile(path, data);
      return true;
    } catch (e: any) {
      throw `Failed to write file: ${e.message}`;
    }
  }

  async readBytesAsync(path: string) {
    try {
      const buffer = await fs.promises.readFile(path);
      return Array.from(buffer);
    } catch (e: any) {
      throw `Failed to read bytes: ${e.message}`;
    }
  }

  async listAsync(directory: string) {
    try {
      return await fs.promises.readdir(directory);
    } catch (e: any) {
      throw `Failed to list directory: ${e.message}`;
    }
  }

  read(path: string) {
    try {
      return fs.readFileSync(path, "utf-8");
    } catch (e: any) {
      throw new Error(`Failed to read file: ${e.message}`);
    }
  }

  write(path: string, data: string) {
    try {
      // By default writeFileSync creates or overwrites the file
      fs.writeFileSync(path, data);
      return true;
    } catch (e: any) {
      throw new Error(`Failed to write file: ${e.message}`);
    }
  }

  readBytes(path: string) {
    try {
      const buffer = fs.readFileSync(path);
      // Converts the Node Buffer into a regular JavaScript array of numbers
      // CursorScript's BaseLibConverter will successfully map this into an ArrayValue
      return Array.from(buffer);
    } catch (e: any) {
      throw new Error(`Failed to read bytes: ${e.message}`);
    }
  }

  exists(path: string) {
    return fs.existsSync(path);
  }

  list(directory: string) {
    try {
      return fs.readdirSync(directory);
    } catch (e: any) {
      throw new Error(`Failed to list directory: ${e.message}`);
    }
  }
}

export const FileLib = ConvertTOMK_Object(new FileL());
