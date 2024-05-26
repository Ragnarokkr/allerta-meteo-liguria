import { Config } from "../libs/build.ts";
import { type ReleaseType, RELEASE_TYPES, inc } from "semver";
import { resolve } from "node:path";
import pkg from "../../package.json";

console.log("Bumping version...");

let release: ReleaseType = "patch";

if (!process.env.RELEASE) {
  console.warn(
    ' - No RELEASE environment variable set, defaulting to "patch" bump'
  );
} else if (!RELEASE_TYPES.includes(process.env.RELEASE as ReleaseType)) {
  console.error(
    ` - RELEASE environment variable must be "${RELEASE_TYPES.join('", "')}"`
  );
  process.exit(1);
} else {
  release = process.env.RELEASE as ReleaseType;
}

try {
  const version = inc(pkg.version, release);
  await Bun.write(
    resolve(Config.basePath, "package.json"),
    JSON.stringify({ ...pkg, version }, null, 2)
  );
  console.log(` - Bumped version to ${version} in manifest file`);
} catch (err) {
  console.error(err);
  process.exit(1);
}
