import { Flags, default as Builder } from "./builder.ts";

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

if (Deno.args.includes("--debug")) {
  new Builder("debug", parseArgs(Deno.args.toSpliced(Deno.args.indexOf("--debug"), 1))).start();
} else if (Deno.args.includes("--release")) {
  new Builder("release", parseArgs(Deno.args.toSpliced(Deno.args.indexOf("--release"), 1))).start();
} else {
  console.error("%cUnknown build mode. Only --debug and --release are supported.", "color:red");
}
