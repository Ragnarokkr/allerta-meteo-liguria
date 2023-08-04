import { DOMParser } from "deno_dom/deno-dom-wasm.ts";

const ENDPOINT = "https://allertaliguria.regione.liguria.it/";
const DB_NAME = "collector_db.json";
let db = [];

try {
  console.log("\nLoading database...");
  db = JSON.parse(Deno.readTextFileSync(DB_NAME));
} catch (err) {
  if (err.code === "ENOENT") {
    Deno.writeTextFileSync(DB_NAME, JSON.stringify({}));
  } else {
    console.error("Database file seems to corrupted. Aborting.\n");
  }
}

try {
  console.log("Fetching the page...");
  const response = await fetch(ENDPOINT);
  const html = await response.text();

  console.log("Parsing content...");
  const dom = new DOMParser().parseFromString(html, "text/html");

  const data = {
    alert: dom?.querySelector("section:nth-of-type(3) div a div")?.className.split("al-msgbar-")[1] ?? "unknown",
    risk: dom?.querySelector("section:nth-of-type(3) div a div h1")?.innerText.toLocaleLowerCase().trim() ?? "unknown",
    info:
      dom?.querySelector("section:nth-of-type(3) div a div h2:nth-of-type(2)")?.innerText.toLocaleLowerCase().trim() ??
      "unknown",
  };
  db.push(data);

  console.log("Saving parsed data into the database...");
  Deno.writeTextFileSync(DB_NAME, JSON.stringify(db));

  console.log("Done.\n");
} catch (err) {
  console.error(err);
}
