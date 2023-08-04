import { DOMParser } from "deno_dom/deno-dom-wasm.ts";

type DatabaseRow = {
  alert: string;
  risk: string;
  info: string;
};

const ENDPOINT = "https://allertaliguria.regione.liguria.it/";
const DB_NAME = "collector_db.json";

let db;

try {
  console.log("\nLoading database...");
  db = new Set([...JSON.parse(Deno.readTextFileSync(DB_NAME)).map((row: DatabaseRow) => JSON.stringify(row))]);
} catch (err) {
  if (err.code === "ENOENT") {
    db = new Set();
  } else {
    console.error("Database file seems to corrupted. Aborting.\n");
    Deno.exit(1);
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
  db.add(JSON.stringify(data));

  console.log("Saving parsed data into the database...");
  Deno.writeTextFileSync(DB_NAME, JSON.stringify(Array.from(db).map((row: string) => JSON.parse(row))));

  console.log("Done.\n");
} catch (err) {
  console.error(err);
}
