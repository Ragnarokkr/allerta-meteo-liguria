import { resolve } from "node:path";
import browserslists from "browserslist";
import { browserslistToTargets, bundle } from "lightningcss";
import { Config, files } from "../libs/build.ts";

console.log("Building CSS...");

const browserTargets = browserslistToTargets(browserslists(">= 0.25%"));

try {
  for await (const file of files("**/*.css", Config.sourcePath)) {
    const { code } = bundle({
      filename: resolve(Config.sourcePath, file),
      targets: browserTargets,
      ...Config.css,
    });

    await Bun.write(resolve(Config.distPath, file), code);
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
