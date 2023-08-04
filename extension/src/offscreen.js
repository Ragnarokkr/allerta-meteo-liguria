// Copyright (c) 2023 Marco Trulla <marco.trulla+dev@gmail.com>
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/// #debug
import { createLog } from "./libs/debug.js";

const log = createLog("offscreen");
/// #enddebug

const OFFSCREEN_DOCUMENT = "webScraper/webScraper.html";

async function hasDocument() {
  const matchedClients = await clients.matchAll();
  for (const client of matchedClients) {
    if (client.url.endsWith(OFFSCREEN_DOCUMENT)) {
      return true;
    }
  }
  return false;
}

async function createOffscreenDocument() {
  /// #debug
  log("creating offscreen document...");
  /// #enddebug

  if (!(await hasDocument())) {
    await chrome.offscreen.createDocument({
      url: chrome.runtime.getURL(OFFSCREEN_DOCUMENT),
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: "Parse DOM",
    });
  }
}

async function closeOffscreenDocument() {
  /// #debug
  log("closing offscreen document");
  /// #enddebug

  if (!(await hasDocument())) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

export async function scrapePage(webPage) {
  await createOffscreenDocument();
  /// #debug
  log("scraping page");
  /// #enddebug

  const response = await chrome.runtime.sendMessage({
    action: 'scrape',
    data: {
      html: await (await fetch(webPage)).text()
    },
    target: "webScraper",
  });
  await closeOffscreenDocument();

  // Fix links with correct domain name
  for (const link of Object.keys(response.response.links)) {
    if (response.response.links[link])
      response.response.links[link] = `${webPage}/${response.response.links[link]}`;
  }

  return response;
}
