import { rcedit } from "rcedit"; // Add this import at the top

const binPath = "C:\\Users\\podda\\.cursorscript\\cursorx.exe";
const version = "1.0.0";

console.log(`🔧 Patching Windows metadata for ${binPath}...`);
await rcedit(binPath, {
  "product-version": version,
  "version-string": {
    CompanyName: "CursorScript",
    FileDescription: "CursorScript Executable",
    LegalCopyright: "© 2024 CursorScript. All rights reserved.",
    OriginalFilename: "cursorx.exe",
    ProductName: "CursorScript",
  },
  "file-version": version,
  icon: "./icon.ico",
});
