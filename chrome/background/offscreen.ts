import type { ScraperResponse } from "../scraper/libs/types/Scraper.ts";

const OFFSCREEN_PATH = "/scraper/index.html";

let creating: Promise<void> | undefined;

/**
 * Checks if an offscreen document exists at the specified path.
 *
 * @param {string} offscreenPath - The path to the offscreen document.
 * @return {Promise<boolean>} A promise that resolves to true if an offscreen document exists at the specified path, false otherwise.
 */
async function hasOffscreenDocument(offscreenPath: string): Promise<boolean> {
  if ("getContexts" in chrome.runtime) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
      documentUrls: [offscreenPath],
    });
    return Boolean(contexts.length);
  } else {
    // @ts-ignore: chrome's global not recognized by ts
    const matchedClients: ServiceWorker.Client[] = await clients.matchAll();
    return matchedClients.some((client) => {
      client.url.includes(chrome.runtime.id);
    });
  }
}

/**
 * Sets up an offscreen document if it doesn't already exist.
 *
 * @return {Promise<void>} A promise that resolves when the offscreen document is set up.
 */
async function setupOffscreenDocument(): Promise<void> {
  const existingContexts = await hasOffscreenDocument(
    chrome.runtime.getURL(OFFSCREEN_PATH)
  );

  if (existingContexts) return;

  // create offscreen document
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: OFFSCREEN_PATH,
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: "Parse DOM",
    });
    await creating;
    creating = undefined;
  }
}

/**
 * Closes the offscreen document if it exists.
 *
 * @return {Promise<void>} A promise that resolves when the offscreen document is closed.
 */
async function closeOffscreenDocument(): Promise<void> {
  if (!(await hasOffscreenDocument(OFFSCREEN_PATH))) return;
  await chrome.offscreen.closeDocument();
}

/**
 * Scrapes the specified URL by setting up an offscreen document, sending a
 * message to the scraper, and closing the offscreen document. The scraped
 * links are modified to have the correct domain.
 *
 * @param {string} url - The URL to be scraped.
 * @return {Promise<ScraperResponse>} A promise that resolves to the response object containing the scraped data.
 */
export async function scrape(url: string): Promise<ScraperResponse> {
  await setupOffscreenDocument();
  const response: ScraperResponse = await chrome.runtime.sendMessage({
    action: "scrape",
    data: {
      html: await (await fetch(url)).text(),
    },
    target: "scraper",
  });
  await closeOffscreenDocument();

  // Scraped links has the extension's path in the URL instead of thier domain.
  // This fixes that.
  if (response.success) {
    response.response.links.alert =
      response.response.links.alert ?
        `${url}/${response.response.links.alert}`
      : "";
    response.response.links.forecast =
      response.response.links.forecast ?
        `${url}/${response.response.links.forecast}`
      : "";
    response.response.links.map =
      response.response.links.map ?
        `${url}/${response.response.links.map}`
      : "";
  }

  return response;
}
