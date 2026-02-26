import ConvertTOMK_Object from "./BaseLibConverter";
import { executeCallback } from "./Utils";

class CryptoL {
  uuid() {
    return crypto.randomUUID();
  }

  uuid7() {
    return Bun.randomUUIDv7();
  }

  async hash(data: string) {
    try {
      const argonHash = await Bun.password.hash(data, {
        algorithm: "bcrypt",
        cost: 4,
      });
      return argonHash;
    } catch (error: any) {
      throw `Hashing failed: ${error.message}`;
    }
  }

  async verifyHash(data: string, hash: string) {
    try {
      return await Bun.password.verify(data, hash);
    } catch (error: any) {
      throw `Verification failed: ${error.message}`;
    }
  }

  sha256(data: string) {
    return new Bun.CryptoHasher("sha256").update(data).digest("hex");
  }

  hmacSha256(data: string, key: string) {
    // Bun implements node:crypto natively under the hood in heavily optimized Zig/C++
    return require("node:crypto")
      .createHmac("sha256", key)
      .update(data)
      .digest("hex");
  }

  base64Encode(data: any) {
    if (typeof data === "string") {
      return Buffer.from(data).toString("base64");
    } else if (Array.isArray(data)) {
      return Buffer.from(data).toString("base64");
    }
    throw new Error("base64Encode expects a string or array of bytes");
  }

  base64Decode(data: string) {
    return Buffer.from(data, "base64").toString("utf-8");
  }
}

export const CryptoLib = ConvertTOMK_Object(new CryptoL());
