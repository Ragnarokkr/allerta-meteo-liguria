import { compress } from "https://deno.land/x/zip@v1.2.5/mod.ts";
import { join } from "https://deno.land/std@0.196.0/path/mod.ts";
import { default as ConfigBuild } from "./config_build.ts";

const config = new ConfigBuild("release");

try {
  const cwd = Deno.cwd();
  Deno.chdir(config.buildDir);
  if (
    !(await compress(".", join("..", (config.manifest.name as string).toLowerCase().replace(/\s/g, "-")), {
      flags: ["-9", "-T", "-q"],
    }))
  ) {
    console.error("Error: estension could not be packed.");
  }
  Deno.chdir(cwd);
} catch (err) {
  console.error(err);
  Deno.exit(1);
}

Deno.exit(0);
