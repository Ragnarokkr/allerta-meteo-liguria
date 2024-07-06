import { resolve } from "node:path";
import type { BuildConfig } from "bun";
import { author, version } from "./package.json";

const isProduction = process.env.NODE_ENV === "production";

const basePath = import.meta.dir;
const sourcePath = resolve(import.meta.dir, "chrome");
const distPath = resolve(import.meta.dir, "dist");
const cachePath = resolve(import.meta.dir, ".cache");

// Bun bundling (transpiling and tree-shaking) configuration
const transpile: BuildConfig = {
  entrypoints: [
    `${sourcePath}/background/service_worker.ts`,
    `${sourcePath}/options/index.ts`,
    `${sourcePath}/popup/index.ts`,
    `${sourcePath}/scraper/index.ts`,
  ],
  outdir: distPath,
  format: "esm",
  splitting: true,
  sourcemap: isProduction ? "none" : "inline",
  minify: isProduction,
} as const;

// LightningCSS configuration
const css = {
  minify: true && isProduction,
};

// HTML minifier & terser configuration
const html = {
  removeComments: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true,
};

// SVG to PNG configuration
const svg = {
  "status.svg": {
    sizes: [16, 24, 32],
    colors: {
      green: "hsl(85 100% 36%)",
      yellow: "hsl(51 100% 50%)",
      orange: "hsl(33 100% 50%)",
      red: "hsl(0 100% 44%)",
    },
    options: {
      imageRendering: 0,
      shapeRendering: 2,
    },
  },
  "error.svg": {
    sizes: [16, 24, 32],
    options: {
      imageRendering: 0,
      shapeRendering: 2,
    },
  },
  "update.svg": {
    sizes: [16, 24, 32],
    options: {
      imageRendering: 0,
      shapeRendering: 2,
    },
  },
  "icon.svg": {
    sizes: [16, 32, 48, 128],
    options: {
      background: "white",
      imageRendering: 0,
      shapeRendering: 2,
    },
  },
};

// Images optimization configuration
const images = {
  jpeg: {
    quality: 80,
  },
  png: {
    quality: 100,
  },
  webp: {
    quality: 80,
  },
};

// Manifest configuration
const manifest = {
  manifest_version: 3,
  name: `Allerta Meteo Liguria${isProduction ? "" : " (Dev)"}`,
  version,
  description: "__MSG_extDescription__",
  author,
  homepage_url: "https://github.com/Ragnarokkr/allerta-meteo-liguria/",
  minimum_chrome_version: "111",
  default_locale: "it",
  icons: {
    16: "/assets/icons/icon-16.png",
    32: "/assets/icons/icon-32.png",
    48: "/assets/icons/icon-48.png",
    128: "/assets/icons/icon-128.png",
  },
  action: {
    default_icon: {
      16: "/assets/icons/update-16.png",
      24: "/assets/icons/update-24.png",
      32: "/assets/icons/update-32.png",
    },
    default_popup: "/popup/index.html",
  },
  background: {
    service_worker: "/background/service_worker.js",
    type: "module",
  },
  options_page: "/options/index.html",
  permissions: ["alarms", "notifications", "offscreen", "storage"],
};

// Exporting the config so it can be used in the build tasks
export default {
  isProduction,
  basePath,
  sourcePath,
  distPath,
  cachePath,
  transpile,
  css,
  html,
  svg,
  images,
  manifest,
};
