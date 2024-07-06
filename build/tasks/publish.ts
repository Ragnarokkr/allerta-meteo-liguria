import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import chromeWebstoreUpload, {
  type Item,
  type Options,
} from "chrome-webstore-upload";
import { exists } from "fs-extra";
import { name } from "../../package.json";
import { Config } from "../libs/build.ts";

console.log("Publishing...");

const store = chromeWebstoreUpload({
  extensionId: process.env.WEBSTORE_ID,
  clientId: process.env.WEBSTORE_CLIENT_ID,
  clientSecret: process.env.WEBSTORE_CLIENT_SECRET,
  refreshToken: process.env.WEBSTORE_REFRESH_TOKEN,
} as Options);

const zipPath = resolve(Config.cachePath, `${name.toLowerCase()}.zip`);

if (!(await exists(zipPath))) {
  console.error("Please run 'bun run pack' first.");
  process.exit(1);
}

try {
  const zipFile = createReadStream(zipPath);
  const response: Item = await store.uploadExisting(zipFile);
  if (
    response.uploadState == "SUCCESS" ||
    response.uploadState == "IN_PROGRESS"
  ) {
    console.log(" - Extension successfully uploaded to the webstore");
    process.exit(0);
  } else {
    console.error(response.itemError);
    process.exit(1);
  }
} catch (err) {
  console.error(
    ` - Unable to upload the extension to the webstore. Error: ${err}`
  );
  process.exit(1);
}
