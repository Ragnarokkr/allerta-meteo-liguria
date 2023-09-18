import { Logger } from "logger/mod.ts";
import { join } from "std/path/mod.ts";
import { ReleaseType, parse, increment, format, compare } from "std/semver/mod.ts";
import { stringify } from "std/yaml/mod.ts";
import { default as Config } from "./build.config.ts";

const logger = new Logger();

let release = "patch" as ReleaseType;

if (!Deno.env.get("RELEASE")) {
  logger.warn('No RELEASE environment variable set, defaulting to "patch" bump');
} else if (!["major", "minor", "patch"].includes(Deno.env.get("RELEASE") as ReleaseType)) {
  logger.error('RELEASE environment variable must be "major", "minor" or "patch"');
  Deno.exit(1);
} else {
  release = Deno.env.get("RELEASE") as ReleaseType;
}

try {
  const config = new Config("release"); // debug or release doesn't matter
  const newVersion = increment(parse(config.manifest.version as string), release);

  Deno.writeTextFileSync(
    join(config.extensionDir, "manifest.yaml"),
    stringify({ ...config.manifest, ...{ version: format(newVersion) } })
  );
  logger.info(`Bumped version to ${format(newVersion)} in manifest file`);

  config.changelog[0].url = `https://github.com/Ragnarokkr/allerta-meteo-liguria/compare/${format(newVersion)}...HEAD`;
  config.changelog.push({
    version: format(newVersion),
    date: new Date().toISOString().replace(/T.+Z/, ""),
    url: `https://github.com/Ragnarokkr/allerta-meteo-liguria/releases/tag/${format(newVersion)}`,
  });
  config.changelog.sort((a, b) => {
    if (a.version === "unreleased") return 1;
    if (b.version === "unreleased") return 1;
    return compare(parse(b.version), parse(a.version));
  });
  Deno.writeTextFileSync(join(config.extensionDir, "changelog.yaml"), stringify(config.changelog));
  logger.info(`Added release ${format(newVersion)} notes to changelog`);
} catch (err) {
  logger.error(err);
}
