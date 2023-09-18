import { Logger } from "logger/mod.ts";
import { emptyDirSync } from "std/fs/mod.ts";
import { join } from "std/path/mod.ts";
import { default as Config } from "./build.config.ts";

const logger = new Logger();

const config = new Config(Deno.env.get("PRODUCTION") === "release" ? "release" : "debug");
const flags = Deno.env.get("FLAGS")?.split(",") ?? [];

const CACHE_PATH = ".cache";
const CHROME_TEST_PROFILE_PATH = join(CACHE_PATH, "chrome-test-dir");
const FIRST_RUN_PATH = join(CHROME_TEST_PROFILE_PATH, "First Run");
const PREFERENCES_PATH = join(CHROME_TEST_PROFILE_PATH, "Default", "Preferences");

const BROWSER = "google-chrome";
const BROWSER_FLAGS = [
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
  Deno.writeTextFileSync(FIRST_RUN_PATH, "", { create: true });
  Deno.mkdirSync(join(CHROME_TEST_PROFILE_PATH, "Default"), { recursive: true });
  Deno.writeTextFileSync(PREFERENCES_PATH, JSON.stringify(prefs), { create: true });

  if (flags.includes("dry-run")) Deno.exit(0);

  new Deno.Command(BROWSER, { args: BROWSER_FLAGS }).spawn();
} catch (err) {
  logger.error(err);
  Deno.exit(1);
}

Deno.exit(0);
