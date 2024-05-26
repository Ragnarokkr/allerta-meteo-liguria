import { onAlarm, onChanged, onInstall } from "./events.ts";
import { update } from "./update.ts";

chrome.runtime.onInstalled.addListener(onInstall);

chrome.alarms.onAlarm.addListener(onAlarm);

chrome.storage.onChanged.addListener(onChanged);

// Executes the update at least once at startup before scheduling the next one
update().then(() => {});
