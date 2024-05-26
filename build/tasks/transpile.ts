import type { BuildOutput } from "bun";
import { Config } from "../libs/build.ts";

console.log("Transpiling...");

let results: BuildOutput | undefined;

try {
  results = await Bun.build(Config.transpile);

  if (!results.success) {
    throw new AggregateError(results.logs, "Build failed");
  }
} catch (err) {
  console.error(...(results?.logs ?? []));
  process.exit(1);
}
