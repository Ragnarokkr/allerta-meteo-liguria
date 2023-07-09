import { createLog } from "./debug.js";

const log = createLog("apiManager");

const OFFSCREEN_DOCUMENT = "/api.html";

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
  log("creating offscreen document...");

  if (!(await hasDocument())) {
    await chrome.offscreen.createDocument({
      url: chrome.runtime.getURL(OFFSCREEN_DOCUMENT),
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: "Parse DOM",
    });
  }
}

async function closeOffscreenDocument() {
  log("closing offscreen document");

  if (!(await hasDocument())) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

export async function requestApi(request) {
  await createOffscreenDocument();
  log("requesting API", request);

  const response = await chrome.runtime.sendMessage({
    ...request,
    target: "api",
  });
  await closeOffscreenDocument();
  return response;
}
