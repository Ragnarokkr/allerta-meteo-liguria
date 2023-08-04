// Copyright (c) 2023 Marco Trulla <marco.trulla+dev@gmail.com>
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// @deno-types="npm:chrome-types"
import { Settings, Alert } from "./config.js";
import { scrapePage } from "./offscreen.js";
/// #debug
import { createLog } from "./libs/debug.js";
/// #enddebug

let actionIcon = Alert.error;
let actionText = chrome.i18n.getMessage('action_error');
let lastCall = 0;
let safeGuard = 5;
let settings = Settings;

async function update(timeInterval) {
  /// #debug  
  const log = createLog("update");
  /// #enddebug  

  try {
    /// #debug  
    log('scraping remote page...')
    /// #enddebug      
    const query = await scrapePage(settings.scrapeWebPageURL);

    if (!query.success) {
      actionIcon = Alert.error;
      actionText = chrome.i18n.getMessage('action_error');
    } else {
      chrome.storage.local.set({ lastUpdate: query.response });
    }

    actionIcon = Alert[query.response.alert];
    actionText = chrome.i18n.getMessage('action_update', [new Date(query.response.date).toLocaleString(), query.response.risk]);
  } catch (err) {
    actionIcon = Alert.error;
    actionText = chrome.i18n.getMessage('action_error');
    console.error(err);
  } finally {
    chrome.action.setIcon({
      path: actionIcon,
    });

    chrome.action.setTitle({
      title: actionText
    });

    const diffTime = Date.now() - lastCall;
    if (diffTime < timeInterval) safeGuard--;
    if (safeGuard <= 0) {
      console.error("safeGuard reached 0, exiting");
    } else {
      setTimeout(timer => {
        lastCall = Date.now();
        update(timer);
      }, timeInterval, timeInterval);
    }
  }
}

chrome.storage.onChanged.addListener((changes) => {
  /// #debug
  const log = createLog("storage");
  log("Storage changes detected");
  /// #enddebug
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    /// #debug
    log("key:", key, "old:", oldValue, "new:", newValue);
    /// #enddebug
    if (key === "lastUpdate" && oldValue !== newValue) {
      chrome.notifications.create({
        iconUrl: actionIcon["32"],
        eventTime: Date.now(),
        requireInteraction: true,
        type: "basic",
        title: newValue.risk,
        message: newValue.info,
        buttons: [
          { title: chrome.i18n.getMessage('notification_button1') },
          { title: chrome.i18n.getMessage('notification_button2') }
        ]
      });
    } else if (key === 'settings') {
      settings = newValue;
    }
  }
});

chrome.notifications.onButtonClicked.addListener((_, buttonIndex) => {
  switch (buttonIndex) {
    case 0:
      chrome.tabs.create({ url: settings.scrapeWebPageURL });
      break;
    case 1:
      chrome.tabs.create({ url: settings.arpalWebsite });
      break;
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  /// #debug
  const log = createLog("ext");
  /// #enddebug

  switch (details.reason) {
    case "install":
      {
        /// #debug
        log("installing", "initializing settings");
        /// #enddebug
        await chrome.storage.local.set({ settings: Settings });
      }
      break;
    case "update":
      {
        /// #debug
        log("updating", "previous version", details.previousVersion);
        /// #enddebug
        await chrome.storage.local.clear();
        await chrome.storage.local.set({ settings: Settings });
      }
      break;
    default:
      throw new Error('unreachable');
  }
  main();
});

chrome.runtime.onStartup.addListener(async () => {
  /// #debug
  const log = createLog("ext");
  log("startup", "starting up new profile");
  /// #enddebug

  settings = (await chrome.storage.local.get(['settings'])).settings;
  main();
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.id !== chrome.runtime.id && message.target !== "serviceworker")
    return;

  console.error(message);
});

function main() {
  update(settings.updateTimeInterval);
}
