import ConvertTOMK_Object from "./BaseLibConverter";
import { executeCallback } from "./Utils";

class CryptoL {
  uuid() {
    return crypto.randomUUID();
  }

  uuid7() {
    return Bun.randomUUIDv7();
  }

  hash(data: string, onComplete: any) {
    (async () => {
      try {
        const argonHash = await Bun.password.hash(data, {
          algorithm: "bcrypt",
          cost: 4,
        });

        executeCallback(onComplete, argonHash, null);
      } catch (error: any) {
        executeCallback(onComplete, null, error.message);
      }
    })();
  }

  verifyHash(data: string, hash: string, onComplete: any) {
    (async () => {
      try {
        const isMatch = await Bun.password.verify(data, hash);
        executeCallback(onComplete, isMatch, null);
      } catch (error: any) {
        executeCallback(onComplete, null, error.message);
      }
    })();
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
}

export const CryptoLib = ConvertTOMK_Object(new CryptoL());
