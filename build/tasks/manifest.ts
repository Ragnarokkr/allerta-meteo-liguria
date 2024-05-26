import { Config } from "../libs/build.ts";
import { resolve } from "node:path";

console.log("Building manifest...");

try {
  const target = resolve(Config.distPath, "manifest.json");
  await Bun.write(
    target,
    JSON.stringify(Config.manifest, null, Config.isProduction ? 0 : 2)
  );
} catch (err) {
  console.error(err);
  process.exit(1);
}
