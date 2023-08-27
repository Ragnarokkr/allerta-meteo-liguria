import { DOMParser } from "deno_dom/deno-dom-wasm.ts";
import { message } from "./utils.ts";

type DatabaseRow = {
  alert: string;
  risk: string;
  info: string;
};

const ENDPOINT = "https://allertaliguria.regione.liguria.it/";
const DB_NAME = "collector_db.json";

const flags = Deno.env.get("FLAGS")?.split(",") ?? [];

let db;
let count = 0;

async function scrapeData() {
  try {
    message("\nLoading database...");
    db = new Set([...JSON.parse(Deno.readTextFileSync(DB_NAME)).map((row: DatabaseRow) => JSON.stringify(row))]);
    count = db.size;
    message(`Loaded ${count} entries from database`, true);
  } catch (err) {
    if (err.code === "ENOENT") {
      db = new Set();
    } else {
      console.error("Database file seems to corrupted. Aborting.\n");
      Deno.exit(1);
    }
  }

  message("Fetching the page...");
  const response = await fetch(ENDPOINT);
  const html = await response.text();

  message("Parsing content...");
  const dom = new DOMParser().parseFromString(html, "text/html");
  const sectionCursor = dom?.querySelector(".al-news-ticker-bar") === null ? 3 : 4;

  const data = {
    alert:
      dom?.querySelector(`section:nth-of-type(${sectionCursor}) div a div`)?.className.split("al-msgbar-")[1] ??
      "unknown",
    risk:
      dom?.querySelector(`section:nth-of-type(${sectionCursor}) div a div h1`)?.innerText.toLocaleLowerCase().trim() ??
      "unknown",
    info:
      dom
        ?.querySelector(`section:nth-of-type(${sectionCursor}) div a div h2:nth-of-type(2)`)
        ?.innerText.toLocaleLowerCase()
        .trim() ?? "unknown",
  };
  db.add(JSON.stringify(data));

  if (db.size > count) {
    message("Found new data!");
    message("Saving new data into the database...");
    Deno.writeTextFileSync(DB_NAME, JSON.stringify(Array.from(db).map((row: string) => JSON.parse(row))));
  } else {
    message("No new data found.");
  }

  message("Done.\n");
}

function display() {
  console.table(JSON.stringify(JSON.parse(Deno.readTextFileSync(DB_NAME)), null, 2));
}

async function main() {
  if (flags.length === 0 || flags.includes("scrape")) {
    await scrapeData();
  } else if (flags.includes("display")) {
    display();
  } else {
    console.log(
      "Invalid flag, try FLAGS= or FLAGS=scrape to retrieve data, or FLAGS=display to show database entries."
    );
    Deno.exit(1);
  }
  Deno.exit(0);
}

try {
  main();
} catch (err) {
  console.error(err);
  Deno.exit(1);
}
