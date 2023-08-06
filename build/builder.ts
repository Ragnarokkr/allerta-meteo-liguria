import { emptyDirSync } from "std/fs/mod.ts";
import { join } from "std/path/mod.ts";
import { parse } from "std/yaml/mod.ts";
import { createCanvas } from "skia_canvas/mod.ts";
import convert from "svg_to_png/mod.ts";
import { ConfigMode, ChangeLogType, default as ConfigBuild } from "./config_build.ts";

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
  private _mode: ConfigMode;
  private _config: ConfigBuild;
  private _iconEntries: IconEntries = {};
  private _flags: Flags = {};
  private _fileData = "";

  constructor(mode: ConfigMode, flags: Flags) {
    this._mode = mode;
    this._flags = flags;
    this._config = new ConfigBuild(mode);
  }

  private _msg(str: string, skipped = false, replace = false) {
    // ASCII escape character
    const ESC = "\x1b";
    // control sequence introducer
    const CSI = ESC + "[";

    if (replace) {
      Deno.writeSync(Deno.stdout.rid, new TextEncoder().encode(CSI + "A")); // moves cursor up one line
      Deno.writeSync(Deno.stdout.rid, new TextEncoder().encode(CSI + "K")); // clears from cursor to line end
    }

    console.info(
      `%c[BUILD:${this._mode.toUpperCase()}] ${str} ${skipped ? "(skipped)" : ""}`,
      `color: ${skipped ? "orange" : "green"}`
    );
  }

  private _clean(skip = false) {
    this._msg("Cleaning build directory...", !skip);

    if (!skip) return;

    emptyDirSync(this._config.buildDir);

    this._msg("Cleaning build directory...ok", !skip, true);
  }

  private async _icons(skip = false) {
    this._msg("Generating icons...", !skip);

    if (!skip) return;

    const iconSet: string[] = [];

    emptyDirSync(this._config.iconsDir);

    for (const size of this._config.popupIconSizes) {
      for (const [label, color] of Object.entries(this._config.popupIconColors)) {
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

        const iconPath = join(this._config.iconsDir, `${label}@${size}.png`);
        canvas.save(iconPath, "png");

        this._iconEntries[label] ??= {};
        this._iconEntries[label][size] = iconPath.replace(`${this._config.buildDir}/`, "");
      }
    }

    for (const size of this._config.iconSizes) {
      if (this._flags.verbose)
        iconSet.push(join(this._config.iconsDir, `icon@${size}.png`).replace(`${this._config.buildDir}/`, ""));

      await convert(
        Deno.realPathSync(join(this._config.resourcesDir, "icon.svg")),
        join(this._config.iconsDir, `icon@${size}.png`),
        { width: size, height: size }
      );
    }

    this._msg("Generating icons...ok", !skip, true);

    if (this._flags.verbose) {
      console.table(this._iconEntries);
      console.table(iconSet);
    }
  }

  private async _covers(skip = false) {
    this._msg("Generating covers...", !skip);

    if (!skip) return;

    for (const [imageName, size] of Object.entries(this._config.promoSizes)) {
      await convert(
        Deno.realPathSync(join(this._config.resourcesDir, "cover.svg")),
        join(
          this._config.buildDir,
          "..",
          (this._config.manifest.name as string).toLowerCase().replace(/\s/g, "-") + `-${imageName}.png`
        ),
        { width: size.width, height: size.height }
      );
    }

    this._msg("Generating covers...ok", !skip, true);

    if (this._flags.verbose)
      console.table(
        Object.entries(this._config.promoSizes).map((entry) => [
          `${(this._config.manifest.name as string).toLowerCase().replace(/\s/g, "-")}-${entry[0]}.png`,
          `${entry[1].width}x${entry[1].height}`,
        ])
      );
  }

  private _codeCleaner(options?: CodeCleanerOptions) {
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

    this._fileData = this._fileData
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

  private _preprocessor(context: { [key: string]: string } = {}) {
    for (const [key, value] of Object.entries(context)) {
      const re = new RegExp(`"%{${key}}%"`, "g");
      this._fileData = this._fileData.replace(re, value);
    }
  }

  private _recursive(src: string, dest: string) {
    for (const dirEntry of Deno.readDirSync(src)) {
      if (this._mode === "release" && this._config.excludedFiles.includes(dirEntry.name)) continue;

      if (dirEntry.isDirectory) {
        emptyDirSync(join(dest, dirEntry.name));
        this._recursive(join(src, dirEntry.name), join(dest, dirEntry.name));
      } else if (dirEntry.isFile) {
        this._fileData = Deno.readTextFileSync(join(src, dirEntry.name));
        if (dirEntry.name.endsWith(".js")) {
          if (this._mode === "release")
            this._codeCleaner({
              debug: true,
              comments: true,
            });
          this._preprocessor({
            generatedIcons: JSON.stringify(this._iconEntries, null, this._mode === "debug" ? 2 : undefined),
          });
        }
        Deno.writeTextFileSync(join(dest, dirEntry.name), this._fileData);
      }
    }
  }

  private _files(skip = false) {
    this._msg("Preprocessing and copying files...", !skip);

    if (!skip) return;

    this._recursive(this._config.sourceDir, this._config.buildDir);

    this._msg("Preprocessing and copying files...ok", !skip, true);
  }

  private _manifest(skip = false) {
    this._msg("Generating manifest.json...", !skip);

    if (!skip) return;

    Deno.writeTextFileSync(
      join(this._config.buildDir, "manifest.json"),
      JSON.stringify(this._config.manifest, null, this._mode === "debug" ? 2 : undefined)
    );

    this._msg("Generating manifest.json...ok", !skip, true);
  }

  private _changelog(skip = false) {
    this._msg("Generating changelog.md...", !skip);

    if (!skip) return;

    const text = [
      "# Changelog\n",
      "All notable changes to this project will be documented in this file.\n",
      "The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),",
      "and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n",
    ];

    const links: string[] = [];

    for (const change of this._config.changelog) {
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

    Deno.writeTextFileSync(join(this._config.buildDir, "changelog.md"), `${text.join("\n")}\n${links.join("\n")}`);

    this._msg("Generating changelog.md...ok", !skip, true);
  }

  private _locales(skip = false) {
    this._msg("Generating locale files...", !skip);

    if (!skip) return;

    const locales: { [key: string]: LocalesDictionary } = {};
    const yamlFile = Deno.readTextFileSync(join(this._config.resourcesDir, "locales.yaml"));
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
      emptyDirSync(join(this._config.buildDir, "_locales", lang));
      Deno.writeTextFileSync(
        join(this._config.buildDir, "_locales", lang, "messages.json"),
        JSON.stringify(dict, null, this._mode === "debug" ? 2 : undefined)
      );
    }

    this._msg("Generating locale files...ok", !skip, true);
  }

  private _license(skip = false) {
    this._msg("Generating license file...", !skip);

    if (!skip) return;

    Deno.copyFileSync("LICENSE", join(this._config.buildDir, "license.txt"));

    this._msg("Generating license file...ok", !skip, true);
  }

  private _setup() {
    this._msg("Setting up build...");
    this._clean(this._flags.clean);
  }

  private async _build() {
    await this._icons(this._flags.icons);
    await this._covers(this._flags.covers);
    this._files(this._flags.copy);
    this._manifest(this._flags.manifest);
    this._locales(this._flags.locales);
    this._changelog(this._flags.changelog);
    this._license(this._flags.license);
  }

  private _tearDown() {
    this._msg("Tearing down build...");
  }

  async start() {
    console.log();
    this._setup();
    await this._build();
    this._tearDown();
    console.log();
  }
}

export default Builder;
