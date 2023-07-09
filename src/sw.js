// Copyright (c) 2023 Marco Trulla <marco.trulla+dev@gmail.com>
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import resources from "./resources.js";
import settings from "./settings.js";
import { requestApi } from "./apiManager.js";
import { createLog } from "./debug.js";

// Icon alert status
const iconAlertStatus = {
  red: { files: resources.icons.red },
  orange: { files: resources.icons.orange },
  yellow: { files: resources.icons.yellow },
  green: { files: resources.icons.green },
  error: { files: resources.icons.error },
};

let actionIcon = resources.icons.error;
let state = settings;

async function getCurrentAlertStatus(html) {
  const log = createLog("getCurrentAlertStatus");
  log("requesting current status");
  return (
    await requestApi({
      action: "get_zones_status",
      data: { html },
    })
  )?.zones;
}

async function update(timeInterval) {
  const log = createLog("update");

  let lastStatus;

  try {
    log("fetching the page...", state.scrapeWebPageURL);
    const response = await fetch(state.scrapeWebPageURL);
    const html = await response.text();

    const zones = await getCurrentAlertStatus(html);

    if (!zones) {
      log("no zones returned");
      lastStatus = "error";
      actionIcon = resources.icons.error;
    } else {
      const status = JSON.stringify(zones);
      log("returned zones", status);

      if (/red/i.test(status)) lastStatus = "red";
      else if (/orange/i.test(status)) lastStatus = "orange";
      else if (/yellow/i.test(status)) lastStatus = "yellow";
      else if (/green/i.test(status)) lastStatus = "green";
      else lastStatus = "error";
      chrome.storage.local.set({ zones });
    }

    chrome.storage.local.set({ lastStatus });
    actionIcon = iconAlertStatus[lastStatus].files;
  } catch (err) {
    actionIcon = resources.icons.error;
    console.error(err);
  } finally {
    chrome.action.setIcon({
      path: actionIcon,
    });

    setTimeout(update, timeInterval);
  }
}

chrome.storage.onChanged.addListener(async (changes) => {
  const log = createLog("storage");
  log("Storage changes detected");
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    log("key:", key, "old:", oldValue, "new:", newValue);
    if (key === "lastStatus" && oldValue !== newValue) {
      const { zones } = await chrome.storage.local.get("zones");
      chrome.notifications.create({
        iconUrl: actionIcon["32"],
        eventTime: Date.now(),
        requireInteraction: true,
        type: "basic",
        title: "Allerta Meteo Liguria",
        message: `Stato di allerta aggiornato.\n\nA: ${zones.zoneA}; B: ${zones.zoneB}; C: ${zones.zoneC}; D: ${zones.zoneD}; E: ${zones.zoneE}`,
      });
    } else if (key === "scrapeWebPageURL") {
      state.scrapeWebPageURL = newValue;
    } else if (key === "updateTimeInterval") {
      state.updateTimeInterval = newValue;
    }
  }
});

chrome.action.onClicked.addListener(() => {
  const log = createLog("popup");
  log("click event", "opening page", state.scrapeWebPageURL);

  chrome.tabs.create({
    url: state.scrapeWebPageURL,
  });
});

chrome.runtime.onInstalled.addListener(async (details) => {
  const log = createLog("ext");

  switch (details.reason) {
    case "install":
      {
        log("installing", "initializing settings");
        await chrome.storage.local.set(settings);
        main();
      }
      break;
    case "update":
      {
        log("updating", "previous version", details.previousVersion);
        const _state = await chrome.storage.local.get();
        state = { ...settings, ..._state };
        main();
      }
      break;
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const log = createLog("ext");
  log("startup", "starting up new profile");

  const _state = await chrome.storage.local.get();
  state = { ...settings, ..._state };
  main();
});

chrome.runtime.onMessage.addListener((message, sender) => {
  const log = createLog("onMessage");

  if (sender.id !== chrome.runtime.id && message.target !== "serviceworker")
    return;

  log(message);
});

async function main() {
  update(state.updateTimeInterval);
}
