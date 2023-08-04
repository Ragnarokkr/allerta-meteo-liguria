import { join } from "std/path/mod.ts";
import { ReleaseType, parse, increment, format } from "std/semver/mod.ts";
import { stringify } from "std/yaml/mod.ts";
import { default as ConfigBuild } from "./config_build.ts";

try {
  if (Deno.args.length === 0) {
    console.error("--major, --minor, or --patch is required");
    Deno.exit(1);
  } else {
    const release = Deno.args[0].split("--")[1] as ReleaseType;

    if (!["major", "minor", "patch"].includes(release)) {
      console.error("--major, --minor, or --patch is required");
      Deno.exit(1);
    }

    const config = new ConfigBuild("release"); // debug or release doesn't matter
    const newVersion = increment(parse(config.manifest.version as string), release);
    Deno.writeTextFileSync(
      join(config.extensionDir, "manifest.yaml"),
      stringify({ ...config.manifest, ...{ version: format(newVersion) } })
    );
  }
} catch (err) {
  console.error(err);
}
