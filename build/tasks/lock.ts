import { exists, rm } from "fs-extra";
import { Config } from "../libs/build.ts";
import { resolve } from "node:path";

const lockFile = resolve(Config.basePath, "build.lock");

if (Config.isProduction) {
  await Bun.write(lockFile, "1");
} else {
  (await exists(lockFile)) && (await rm(lockFile));
}
