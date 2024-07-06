import { resolve } from "node:path";
import { ensureFile } from "fs-extra";
import { minify } from "html-minifier-terser";
import { Config, files } from "../libs/build.ts";

console.log("Building HTML...");

for await (const file of files("**/*.html", Config.sourcePath)) {
  try {
    let code = "";
    if (Config.isProduction) {
      code = await minify(
        await Bun.file(resolve(Config.sourcePath, file)).text(),
        Config.html
      );
    } else {
      code = await Bun.file(resolve(Config.sourcePath, file)).text();
    }
    await ensureFile(resolve(Config.distPath, file));
    await Bun.write(resolve(Config.distPath, file), code);
  } catch (error) {
    console.error(error);
  }
}
