import { resolve } from "node:path";
import { ensureFile } from "fs-extra";
import { minify } from "html-minifier-terser";
import { marked } from "marked";
import { Config, files } from "../libs/build.ts";

console.log("Building Markdown...");

for await (const file of files("**/*.md", Config.sourcePath)) {
  try {
    let code = await marked.parse(
      await Bun.file(resolve(Config.sourcePath, file)).text()
    );
    if (Config.isProduction) {
      code = await minify(code, Config.html);
    }
    const target = resolve(Config.distPath, file.replace(".md", ".html"));
    await ensureFile(target);
    await Bun.write(target, code);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
