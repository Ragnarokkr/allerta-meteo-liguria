import { Logger } from "logger/mod.ts";
import { load } from "std/dotenv/mod.ts";
import { join } from "std/path/mod.ts";
import { readableStreamFromReader } from "std/io/mod.ts";
import { APIClient } from "cwa/mod.ts";
import { default as Config } from "./build.config.ts";

const env = load();

const logger = new Logger();

const config = new Config("release");

const apiClient = new APIClient({
  id: env["WEBSTORE_ID"],
  clientId: env["WEBSTORE_CLIENT_ID"],
  clientSecret: env["WEBSTORE_CLIENT_SECRET"],
  refreshToken: env["WEBSTORE_REFRESH_TOKEN"],
});
const filePath = join(config.buildDir, `${(config.manifest.name as string).toLowerCase().replace(/\s/g, "-")}.zip`);
const fileReader = await Deno.open(filePath, { read: true });
const fileStream = readableStreamFromReader(fileReader);
const uploadResult = await apiClient.uploadExisting(fileStream);

if (uploadResult.uploadState == "SUCCESS" || uploadResult.uploadState == "IN_PROGRESS") {
  logger.info("[PUBLISH:WEBSTORE] extension successfully uploaded to the webstore");
} else {
  logger.error(`[PUBLISH:WEBSTORE] unable to upload the extension to the webstore. Error: ${uploadResult.uploadState}`);
  Deno.exit(1);
}

Deno.exit(0);
