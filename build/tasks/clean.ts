import { exists, rmdir } from "fs-extra";
import { Config } from "../libs/build.ts";

console.log("Cleaning...");

try {
  (await exists(Config.cachePath)) &&
    (await rmdir(Config.cachePath, { recursive: true }));

  (await exists(Config.distPath)) &&
    (await rmdir(Config.distPath, { recursive: true }));
} catch (error) {
  console.error(error);
  process.exit(1);
}
