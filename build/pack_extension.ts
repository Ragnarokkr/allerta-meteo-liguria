import { Logger } from "logger/mod.ts";
import { compress } from "zip/mod.ts";
import { join } from "std/path/mod.ts";
import { default as Config } from "./build.config.ts";

const logger = new Logger();

const config = new Config("release");

try {
  const cwd = Deno.cwd();
  Deno.chdir(config.buildDir);
  if (
    !(await compress(".", join("..", (config.manifest.name as string).toLowerCase().replace(/\s/g, "-")), {
      flags: ["-9", "-T", "-q"],
    }))
  ) {
    logger.error("[PUBLISH:PACKAGE] error while trying to pack the extension");
  } else {
    logger.info("[PUBLISH:PACKAGE] extension packed successfully");
  }
  Deno.chdir(cwd);
} catch (err) {
  logger.error(err);
  Deno.exit(1);
}

Deno.exit(0);
