// @deno-types="npm:chrome-types"
import { join, SEP } from "https://deno.land/std@0.196.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.196.0/yaml/mod.ts";

type ManifestType = { [key: string]: unknown };

export type ConfigMode = "release" | "debug";

export type DistFilesOptions = { root?: string; includePath?: boolean };

export default class ConfigBuild {
  private _manifest: ManifestType = {};
  private _files: Array<string> = [];

  constructor(private mode: ConfigMode) {
    this._manifest = parse(Deno.readTextFileSync(join(this.extensionDir, "manifest.yaml"))) as ManifestType;
  }

  get manifest(): ManifestType {
    return this._manifest;
  }

  get extensionDir() {
    return "extension";
  }

  get resourcesDir() {
    return join(this.extensionDir, "resources");
  }

  get sourceDir() {
    return join(this.extensionDir, "src");
  }

  get buildDir() {
    return this.mode === "debug" ? join("dist", "debug") : join("dist", "release");
  }

  get iconsDir() {
    return join(this.buildDir, "icons");
  }

  get popupIconSizes() {
    return [16, 24, 32];
  }

  get iconSizes() {
    return [16, 32, 48, 128];
  }

  get promoSizes() {
    return {
      marquee: { width: 1400, height: 560 },
      small: { width: 440, height: 280 },
    };
  }

  get popupIconColors() {
    return {
      green: "hsl(85, 100%, 36%)",
      yellow: "hsl(51, 100%, 50%)",
      orange: "hsl(33, 100%, 50%)",
      red: "hsl(0, 100%, 44%)",
      error: "hsl(0, 0%, 80%)",
    };
  }

  get excludedFiles() {
    return ["libs", "debug.js"];
  }

  getDistFiles(options?: DistFilesOptions) {
    const { root = this.buildDir, includePath = false } = options ?? {};
    const dirEntries = Deno.readDirSync(root);
    for (const dirEntry of dirEntries) {
      if (dirEntry.isFile) {
        this._files.push(join(root, dirEntry.name));
      } else if (dirEntry.isDirectory) {
        this.getDistFiles({ root: join(root, dirEntry.name), includePath });
      }
    }
    return this._files.map((file) => (includePath ? file : file.split(root + SEP)[1]));
  }
}
