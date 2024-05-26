import { Config, files } from "../libs/build.ts";
import { resolve } from "node:path";
import { copy } from "fs-extra";

console.log("Copying files...");

for await (const file of files("**/*.{txt,ttf}", Config.sourcePath)) {
  try {
    await copy(
      resolve(Config.sourcePath, file),
      resolve(Config.distPath, file),
      { overwrite: true }
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
