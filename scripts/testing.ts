// Copyright (c) 2023 Marco Trulla
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { mkdir, rm } from "fs/promises";
import { exit } from "process";

const DIST_PATH = "./src";
const CACHE_PATH = ".cache";
const CHROME_TEST_PROFILE_PATH = `${CACHE_PATH}/chrome-test-dir`;
const FIRST_RUN_PATH = `${CHROME_TEST_PROFILE_PATH}/First Run`;
const PREFERENCES_PATH = `${CHROME_TEST_PROFILE_PATH}/Default/Preferences`;

const BROWSER = "google-chrome";
const FLAGS = [
  "--no-default-browser-check",
  `--disable-extensions-except=${DIST_PATH}`,
  `--load-extension=${DIST_PATH}`,
  `--user-data-dir=${CHROME_TEST_PROFILE_PATH}`,
];

try {
  await rm(CHROME_TEST_PROFILE_PATH, { recursive: true, force: true });

  await mkdir(CHROME_TEST_PROFILE_PATH, { recursive: true });

  await Bun.write(FIRST_RUN_PATH, "");

  await mkdir(`${CHROME_TEST_PROFILE_PATH}/Default/`, { recursive: true });
  const prefs = {
    browser: { has_seen_welcome_page: false },
    extensions: { ui: { developer_mode: true } },
  };
  await Bun.write(PREFERENCES_PATH, JSON.stringify(prefs));

  Bun.spawn([BROWSER, ...FLAGS], {
    env: { ...process.env },
  });
} catch (err) {
  console.error(err);
  exit(1);
}

exit(0);
