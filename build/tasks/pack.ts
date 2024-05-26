import { Config } from "../libs/build.ts";
import { resolve } from "node:path";
import { zip } from "cross-zip";
import { name } from "../../package.json";
import { ensureDir, exists } from "fs-extra";

function onError(error: Error | undefined) {
  if (error) {
    console.error(error);
    process.exit(1);
  }
}

console.log("Packaging...");

if (!(await exists(resolve(Config.basePath, "build.lock")))) {
  console.error("Please run 'bun run build' and then 'bun run bump' first.");
  process.exit(1);
}

await ensureDir(Config.cachePath);
const outPath = resolve(Config.cachePath, `${name.toLowerCase()}.zip`);
process.chdir(Config.distPath);
zip(".", outPath, onError);
process.chdir(Config.basePath);
console.log(` - Packaged to ${outPath.replace(Config.basePath, ".")}`);
console.log(
  ' - When you are ready, run "bun run publish" to publish the updates to the webstore'
);
