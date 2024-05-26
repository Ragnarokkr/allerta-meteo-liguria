import { Config, files } from "../libs/build.ts";
import { resolve } from "node:path";
import { copy } from "fs-extra";
import sharp from "sharp";

console.log("Copy/Optimizing images...");

for await (const file of files("**/*.{jpg,jpeg,png,webp}", Config.sourcePath)) {
  try {
    if (!Config.isProduction) {
      await copy(
        resolve(Config.sourcePath, file),
        resolve(Config.distPath, file),
        { overwrite: true }
      );
    } else {
      // Optimizes images when in production
      const image = sharp(resolve(Config.sourcePath, file));

      if (/\.jpe?g$/i.test(file)) {
        await image
          .jpeg(Config.images.jpeg ?? undefined)
          .toFile(resolve(Config.distPath, file));
      } else if (/\.png$/i.test(file)) {
        await image
          .png(Config.images.png ?? undefined)
          .toFile(resolve(Config.distPath, file));
      } else if (/\.webp$/i.test(file)) {
        await image
          .webp(Config.images.webp ?? undefined)
          .toFile(resolve(Config.distPath, file));
      } else {
        throw new Error(`Unsupported image format ${file}`);
      }
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
