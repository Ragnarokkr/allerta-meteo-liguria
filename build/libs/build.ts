import { Glob, type GlobScanOptions } from "bun";

export { default as Config } from "../../build.config.ts";

export function files(pattern: string, options?: string | GlobScanOptions) {
  return new Glob(pattern).scan(options);
}
