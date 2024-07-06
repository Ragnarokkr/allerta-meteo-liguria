import { basename, dirname, resolve } from "node:path";
import {
  type RenderedImage,
  Resvg,
  type ResvgRenderOptions,
} from "@resvg/resvg-js";
import { ensureDir } from "fs-extra";
import sharp, { type PngOptions } from "sharp";
import { Config, files } from "../libs/build.ts";

/*
  TYPES AND INTERFACES
*/
interface SVGConfig {
  [key: string]: SVGOptions;
}

type SVGOptionSize = number;
type SVGOptionSizeNamed = {
  name: string;
  width: number;
  height: number;
};
type SVGOptionSizes = SVGOptionSize[] | SVGOptionSizeNamed[];
type SVGOptions = {
  sizes?: SVGOptionSizes;
  colors?: Record<string, string>;
  options?: ResvgRenderOptions;
};

/*
  CONFIGURATION
*/
const defaultResvgOptions: ResvgRenderOptions = {
  background: "transparent",
  fitTo: {
    mode: "original",
  },
} as const;

const defaultSharpPNGOptions: PngOptions = {
  compressionLevel: 9,
  quality: 100,
} as const;

/*
  UTILS
*/

async function openSVG(file: string) {
  return await Bun.file(resolve(Config.sourcePath, file)).text();
}

async function savePNG(data: RenderedImage, file: string) {
  await ensureDir(dirname(file));
  await sharp(data.asPng()).png(defaultSharpPNGOptions).toFile(file);
}

async function svgToPngSize(
  file: string,
  size: SVGOptionSize,
  { options }: SVGOptions
) {
  const target = resolve(Config.distPath, file).replace(".svg", `-${size}.png`);

  try {
    const svg = await openSVG(file);
    const resvg = new Resvg(svg, {
      ...defaultResvgOptions,
      ...options,
      fitTo: { mode: "width", value: size },
    });
    await savePNG(resvg.render(), target);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function svgToPngNamedSize(
  file: string,
  size: SVGOptionSizeNamed,
  { options }: SVGOptions
) {
  const target = resolve(Config.distPath, file).replace(
    ".svg",
    `-${size.name}.png`
  );

  try {
    const svg = await openSVG(file);
    const resvg = new Resvg(svg, {
      ...defaultResvgOptions,
      ...options,
      fitTo: { mode: "width", value: size.width },
    });
    await savePNG(resvg.render(), target);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function svgToPngColor(
  file: string,
  color: string,
  components: string,
  { options }: SVGOptions
) {
  const target = resolve(Config.distPath, file, `${color}.png`);

  try {
    const svg = await openSVG(file);
    const resvg = new Resvg(
      svg.replaceAll("fill:#000000", `fill:${components}`),
      {
        ...defaultResvgOptions,
        ...options,
      }
    );
    await savePNG(resvg.render(), target);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function svgToPngColorSize(
  file: string,
  size: SVGOptionSize | SVGOptionSizeNamed,
  color: string,
  components: string,
  { options }: SVGOptions
) {
  const target = resolve(
    Config.distPath,
    dirname(file),
    `${color}-${size}.png`
  );

  try {
    const svg = await openSVG(file);
    const resvg = new Resvg(
      svg.replaceAll("fill:#000000", `fill:${components}`),
      {
        ...defaultResvgOptions,
        ...options,
        fitTo: {
          mode: "width",
          value: typeof size === "number" ? size : size.width,
        },
      }
    );
    await savePNG(resvg.render(), target);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

console.log("Building SVG...");

for await (const file of files("**/*.svg", Config.sourcePath)) {
  if (!(basename(file) in Config.svg)) continue;

  const options = (Config.svg as SVGConfig)[basename(file)];

  if (options?.sizes && options.colors) {
    // Convert SVG to PNG with different sizes and colors
    for (const size of options.sizes) {
      for (const [color, components] of Object.entries(options.colors)) {
        await svgToPngColorSize(file, size, color, components, options);
      }
    }
  } else if (options?.sizes) {
    // Convert SVG to PNG with different sizes
    for (const size of options.sizes) {
      if (typeof size === "number") {
        await svgToPngSize(file, size, options);
      } else {
        await svgToPngNamedSize(file, size, options);
      }
    }
  } else if (options?.colors) {
    // Convert SVG to PNG with different colors
    for (const [color, components] of Object.entries(options.colors)) {
      await svgToPngColor(file, color, components, options);
    }
  }
}
