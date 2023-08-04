import { emptyDirSync } from "std/fs/mod.ts";
import { join } from "std/path/mod.ts";

import { default as ConfigBuild } from "./config_build.ts";

const config = new ConfigBuild(Deno.args.includes("--release") ? "release" : "debug");

const CACHE_PATH = ".cache";
const CHROME_TEST_PROFILE_PATH = join(CACHE_PATH, "chrome-test-dir");
const FIRST_RUN_PATH = join(CHROME_TEST_PROFILE_PATH, "First Run");
const PREFERENCES_PATH = join(CHROME_TEST_PROFILE_PATH, "Default", "Preferences");

const BROWSER = "google-chrome";
const FLAGS = [
  "--no-default-browser-check",
  `--disable-extensions-except=${config.buildDir}`,
  `--load-extension=${config.buildDir}`,
  `--user-data-dir=${CHROME_TEST_PROFILE_PATH}`,
];

const prefs = {
  browser: { has_seen_welcome_page: false },
  extensions: { ui: { developer_mode: true } },
};

try {
  emptyDirSync(CHROME_TEST_PROFILE_PATH);
  await Deno.writeTextFile(FIRST_RUN_PATH, "", { create: true });
  await Deno.mkdir(join(CHROME_TEST_PROFILE_PATH, "Default"), { recursive: true });
  await Deno.writeTextFile(PREFERENCES_PATH, JSON.stringify(prefs), { create: true });
  if (Deno.args.includes("--setup")) Deno.exit(0);

  new Deno.Command(BROWSER, { args: FLAGS }).spawn();
} catch (err) {
  console.error(err);
  Deno.exit(1);
}

Deno.exit(0);
