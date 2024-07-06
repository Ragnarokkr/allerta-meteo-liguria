import type { StatusLastUpdate } from "../libs/types/status.ts";
import { Scraper } from "./libs/Scraper.ts";

// ---- Messaging SW <-> OSP -----
function successResponse(data: { response: StatusLastUpdate }) {
  return { target: "serviceworker", success: true, ...data };
}

function errorResponse(data: { error: string }) {
  return { target: "serviceworker", success: false, ...data };
}

function messagesHandler(
  // biome-ignore lint/suspicious/noExplicitAny: Chrome declaration expects for `any` type
  message: any,
  sender: chrome.runtime.MessageSender,
  // biome-ignore lint/suspicious/noExplicitAny: Chrome declaration expects for `any` type
  sendResponse: (response?: any) => void
) {
  if (sender.id !== chrome.runtime.id && message.target !== "scraper") return;
  const dom = new DOMParser().parseFromString(message.data.html, "text/html");
  const scraper = new Scraper(dom);
  try {
    if (message.action === "scrape") {
      const response: StatusLastUpdate = {
        alert: scraper.alert ?? "",
        risk: scraper.risk ?? "",
        info: scraper.info ?? "",
        date: scraper.date,
        links: scraper.links,
      };
      sendResponse(successResponse({ response }));
    } else {
      sendResponse(errorResponse({ error: "Invalid request" }));
    }
  } catch (err: unknown) {
    chrome.runtime.sendMessage(
      errorResponse({ error: (err as Error).message })
    );
  }
}

chrome.runtime.onMessage.addListener(messagesHandler);
