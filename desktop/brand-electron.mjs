import { rcedit } from "rcedit";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const executable = path.join(root, "node_modules", "electron", "dist", "electron.exe");
const icon = path.join(root, "desktop", "think-anas-sahara.ico");

await rcedit(executable, {
  icon,
  "version-string": {
    ProductName: "think.anas",
    FileDescription: "think.anas",
    InternalName: "think.anas.exe",
    OriginalFilename: "think.anas.exe",
    CompanyName: "think.anas",
  },
  "product-version": "1.0.0",
});
