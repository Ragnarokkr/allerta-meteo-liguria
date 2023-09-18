import { Logger } from "logger/mod.ts";
import { emptyDirSync, expandGlobSync } from "std/fs/mod.ts";
import { join, resolve } from "std/path/mod.ts";
import { parse } from "std/yaml/mod.ts";
import { createCanvas } from "skia_canvas/mod.ts";
import convert from "svg_to_png/mod.ts";
import { ConfigMode, ChangeLogType, default as Config } from "./build.config.ts";

const logger = new Logger();

export type Flags = Record<string, boolean>;

export type CodeCleanerOptions = {
  debug?: boolean | { opening: string; closing: string };
  comments?: boolean | Array<string>;
};

type IconEntry = Record<number, string>;
type IconEntries = { [key: string]: IconEntry };

type LocaleItem = {
  message: string | Array<Record<string, string>>;
  description?: string;
  placeholders?: {
    content: string;
    example?: string;
  };
};

type LocalesDictionary = { [key: string]: LocaleItem };

class Builder {
  #mode: ConfigMode;
  #config: Config;
  #iconEntries: IconEntries = {};
  #flags: Flags = {};
  #fileData = "";

  constructor(mode: ConfigMode, flags: Flags) {
    this.#mode = mode;
    this.#flags = flags;
    this.#config = new Config(mode);
  }

  #msg(str: string, skipped = false, replace = false) {
    // ASCII escape character
    const ESC = "\x1b";
    // control sequence introducer
    const CSI = ESC + "[";

    if (replace) {
      Deno.writeSync(Deno.stdout.rid, new TextEncoder().encode(CSI + "A")); // moves cursor up one line
      Deno.writeSync(Deno.stdout.rid, new TextEncoder().encode(CSI + "K")); // clears from cursor to line end
    }

    if (!skipped) {
      logger.info(`[BUILD:${this.#mode.toUpperCase()}] ${str}`);
    } else {
      logger.warn(`[BUILD:${this.#mode.toUpperCase()}] ${str}SKIPPED`);
    }
  }

  #clean(skip = false) {
    this.#msg("Cleaning build directory...", !skip);
    if (!skip) return;
    emptyDirSync(this.#config.buildDir);
    this.#msg("Cleaning build directory...OK", !skip, true);
  }

  async #icons(skip = false) {
    this.#msg("Generating icons...", !skip);

    if (!skip) return;

    const iconSet: string[] = [];

    emptyDirSync(this.#config.iconsDir);

    for (const size of this.#config.popupIconSizes) {
      for (const [label, color] of Object.entries(this.#config.popupIconColors)) {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext("2d");
        const center = size * 0.5;
        const radius = size * 0.5;

        // draw background
        ctx.fillStyle = "transparent";
        ctx.fillRect(0, 0, size, size);

        // draw circle
        ctx.beginPath();
        ctx.ellipse(center, center, radius, radius, Math.PI * 0.25, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "transparent";
        ctx.stroke();

        const iconPath = join(this.#config.iconsDir, `${label}@${size}.png`);
        canvas.save(iconPath, "png");

        this.#iconEntries[label] ??= {};
        this.#iconEntries[label][size] = iconPath.replace(`${this.#config.buildDir}/`, "");
      }
    }

    for (const size of this.#config.iconSizes) {
      if (this.#flags.verbose)
        iconSet.push(join(this.#config.iconsDir, `icon@${size}.png`).replace(`${this.#config.buildDir}/`, ""));

      await convert(
        Deno.realPathSync(join(this.#config.resourcesDir, "icon.svg")),
        join(this.#config.iconsDir, `icon@${size}.png`),
        { width: size, height: size }
      );
    }

    this.#msg("Generating icons...OK", !skip, true);

    if (this.#flags.verbose) {
      console.table(this.#iconEntries);
      console.table(iconSet);
    }
  }

  async #covers(skip = false) {
    this.#msg("Generating covers...", !skip);

    if (!skip) return;

    for (const [imageName, size] of Object.entries(this.#config.promoSizes)) {
      await convert(
        Deno.realPathSync(join(this.#config.resourcesDir, "cover.svg")),
        join(
          this.#config.buildDir,
          "..",
          (this.#config.manifest.name as string).toLowerCase().replace(/\s/g, "-") + `-${imageName}.png`
        ),
        { width: size.width, height: size.height }
      );
    }

    this.#msg("Generating covers...OK", !skip, true);

    if (this.#flags.verbose)
      console.table(
        Object.entries(this.#config.promoSizes).map((entry) => [
          `${(this.#config.manifest.name as string).toLowerCase().replace(/\s/g, "-")}-${entry[0]}.png`,
          `${entry[1].width}x${entry[1].height}`,
        ])
      );
  }

  #codeCleaner(options?: CodeCleanerOptions) {
    let blockOpen: RegExp, blockClose: RegExp;
    let inDebug = false;

    if (typeof options?.debug === "boolean" && options.debug) {
      blockOpen = new RegExp("/// #debug", "g");
      blockClose = new RegExp("/// #enddebug", "g");
    } else if (typeof options?.debug === "object") {
      const { opening, closing } = options.debug;
      blockOpen = new RegExp(opening, "g");
      blockClose = new RegExp(closing, "g");
    }

    this.#fileData = this.#fileData
      .split("\n")
      .filter((line) => {
        if (options?.debug) {
          if (blockOpen.test(line)) {
            inDebug = true;
            return false;
          } else if (blockClose.test(line)) {
            inDebug = false;
            return false;
          } else if (inDebug) {
            return false;
          }
        }

        if (typeof options?.comments === "boolean" && options.comments) {
          if (line.startsWith("//") || line.startsWith("/*")) return false;
        } else if (Array.isArray(options?.comments)) {
          for (const comment of options!.comments) {
            if (line.startsWith(comment)) return false;
          }
        }
        return true;
      })
      .join("\n");
  }

  #preprocessor(context: { [key: string]: string } = {}) {
    for (const [key, value] of Object.entries(context)) {
      const re = new RegExp(`"%{${key}}%"`, "g");
      this.#fileData = this.#fileData.replace(re, value);
    }
  }

  #files(skip = false) {
    this.#msg("Preprocessing and copying files...", !skip);
    if (!skip) return;

    const dirEntries = expandGlobSync(join("**", "*"), {
      root: this.#config.sourceDir,
      ...(this.#mode === "release" ? { exclude: this.#config.excludedFiles } : {}),
    });

    for (const dirEntry of dirEntries) {
      if (dirEntry.isDirectory) {
        emptyDirSync(join(this.#config.buildDir, dirEntry.path.replace(resolve(this.#config.sourceDir), "")));
      } else if (dirEntry.isFile) {
        this.#fileData = Deno.readTextFileSync(dirEntry.path);
        if (dirEntry.name.endsWith(".js")) {
          if (this.#mode === "release")
            this.#codeCleaner({
              debug: true,
              comments: true,
            });
          this.#preprocessor({
            generatedIcons: JSON.stringify(this.#iconEntries, null, this.#mode === "debug" ? 2 : undefined),
          });
        }
        Deno.writeTextFileSync(
          join(this.#config.buildDir, dirEntry.path.replace(resolve(this.#config.sourceDir), "")),
          this.#fileData
        );
      }
    }

    this.#msg("Preprocessing and copying files...OK", !skip, true);
  }

  #manifest(skip = false) {
    this.#msg("Generating manifest.json...", !skip);
    if (!skip) return;

    Deno.writeTextFileSync(
      join(this.#config.buildDir, "manifest.json"),
      JSON.stringify(this.#config.manifest, null, this.#mode === "debug" ? 2 : undefined)
    );
    this.#msg("Generating manifest.json...OK", !skip, true);
  }

  #changelog(skip = false) {
    this.#msg("Generating changelog.md...", !skip);

    if (!skip) return;

    const text = [
      "# Changelog\n",
      "All notable changes to this project will be documented in this file.\n",
      "The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),",
      "and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n",
    ];

    const links: string[] = [];

    for (const change of this.#config.changelog) {
      text.push(`## [${change.version}][${change.version.toLowerCase()}]${change.date ? ` - ${change.date}` : ""}\n`);
      ["Added", "Changed", "Deprecated", "Removed", "Fixed", "Security"].forEach((action) => {
        if (action.toLowerCase() in change) {
          const items: string[] = change[action.toLowerCase() as keyof ChangeLogType] as string[];
          text.push(`### ${action}\n`);
          items.forEach((item) => {
            text.push(`- ${item}`);
          });
        }
      });
      links.push(`[${change.version.toLowerCase()}]: ${change.url}`);
    }

    Deno.writeTextFileSync(join(this.#config.buildDir, "changelog.md"), `${text.join("\n")}\n${links.join("\n")}`);

    this.#msg("Generating changelog.md...OK", !skip, true);
  }

  #locales(skip = false) {
    this.#msg("Generating locale files...", !skip);

    if (!skip) return;

    const locales: { [key: string]: LocalesDictionary } = {};
    const yamlFile = Deno.readTextFileSync(join(this.#config.resourcesDir, "locales.yaml"));
    const jsonFile = parse(yamlFile) as LocalesDictionary;

    // build each locale dictionary
    for (const [localeKey, localeItem] of Object.entries(jsonFile)) {
      for (const [lang, message] of Object.entries(localeItem.message)) {
        locales[lang] ??= {};
        locales[lang][localeKey] = {
          message,
          description: localeItem.description,
          placeholders: localeItem.placeholders,
        };
      }
    }

    // save all locale dictionaries
    for (const [lang, dict] of Object.entries(locales)) {
      emptyDirSync(join(this.#config.buildDir, "_locales", lang));
      Deno.writeTextFileSync(
        join(this.#config.buildDir, "_locales", lang, "messages.json"),
        JSON.stringify(dict, null, this.#mode === "debug" ? 2 : undefined)
      );
    }

    this.#msg("Generating locale files...OK", !skip, true);
  }

  #license(skip = false) {
    this.#msg("Generating license file...", !skip);
    if (!skip) return;
    Deno.copyFileSync("LICENSE", join(this.#config.buildDir, "license.txt"));
    this.#msg("Generating license file...OK", !skip, true);
  }

  #setup() {
    this.#msg("Setting up build...");
    this.#clean(this.#flags.clean);
  }

  async #build() {
    await this.#icons(this.#flags.icons);
    await this.#covers(this.#flags.covers);
    this.#files(this.#flags.copy);
    this.#manifest(this.#flags.manifest);
    this.#locales(this.#flags.locales);
    this.#changelog(this.#flags.changelog);
    this.#license(this.#flags.license);
  }

  #tearDown() {
    this.#msg("Tearing down build...");
  }

  async start() {
    this.#setup();
    await this.#build();
    this.#tearDown();
  }
}

export default Builder;
