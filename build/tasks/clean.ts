import { Config } from "../libs/build.ts";
import { exists, rmdir } from "fs-extra";

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
