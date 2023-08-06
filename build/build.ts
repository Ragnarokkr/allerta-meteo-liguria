import { Flags, default as Builder } from "./builder.ts";
import { ConfigMode } from "./config_build.ts";

const target = (Deno.env.get("PRODUCTION") ?? "debug") as ConfigMode;
const flags = Deno.env.get("FLAGS")?.split(",") ?? [];

function parseArgs(args: string[]) {
  const flags: Flags = {
    clean: true,
    icons: true,
    covers: false,
    copy: true,
    manifest: true,
    locales: true,
    license: true,
    changelog: false,
    verbose: false,
  };

  for (const arg of args) {
    flags[arg.replace(/^--(no-)?/, "")] = !arg.startsWith("--no-");
  }

  return flags;
}

if (["debug", "release"].includes(target)) {
  new Builder(target, parseArgs(flags)).start();
} else {
  console.error(`Invalid production target mode! Expected 'debug' or 'release' but got ${target}`);
}
