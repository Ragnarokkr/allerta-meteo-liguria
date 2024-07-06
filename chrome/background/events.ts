import { sentenceCase, titleCase } from "../libs/utils.ts";
import {
  StatusActionIcons,
  createIconDescriptor,
  defaultSettings,
  defaultStatus,
} from "./setup.ts";
import { update } from "./update.ts";

export async function onInstall(details: chrome.runtime.InstalledDetails) {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    await Promise.all([
      chrome.storage.local.clear(),
      chrome.storage.local.set({ settings: defaultSettings }),
      chrome.storage.local.set({ status: defaultStatus }),
      chrome.storage.local.set({ internalStatus: "idle" }),
    ]);
  } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    await Promise.all([
      chrome.storage.local.set({ status: defaultStatus }),
      chrome.storage.local.set({ internalStatus: "idle" }),
    ]);
  }
}

export async function onAlarm(alarm: chrome.alarms.Alarm) {
  if (alarm.name === "update status") {
    const { internalStatus } = await chrome.storage.local.get("internalStatus");

    if (internalStatus === "idle") {
      await chrome.storage.local.set({ internalStatus: "updating" });
      await update();
      await chrome.storage.local.set({ internalStatus: "idle" });
    }
  }
}

export async function onChanged(
  changes: chrome.storage.StorageChange,
  areaName: string
) {
  if (areaName !== "local") return;
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === "status" && newValue) {
      const icons = createIconDescriptor(newValue.actionIcon);
      await chrome.action.setIcon({ path: Object.fromEntries(icons) });
      await chrome.action.setTitle({ title: newValue.actionText });
      if (
        newValue.actionIcon !== StatusActionIcons.update &&
        newValue.actionIcon !== StatusActionIcons.error
      ) {
        const isRiskUpdated =
          newValue.lastUpdate.risk !== oldValue.lastUpdate?.risk;
        const isInfoUpdated =
          newValue.lastUpdate.info !== oldValue.lastUpdate?.info;

        if (!isRiskUpdated && !isInfoUpdated) return;

        chrome.notifications.create({
          iconUrl: icons.get(32)!,
          eventTime: Date.now(),
          type: "basic",
          title: titleCase`${newValue.lastUpdate.risk}`,
          message: sentenceCase`${newValue.lastUpdate.info}`,
          buttons: [
            { title: chrome.i18n.getMessage("civilProtection") },
            { title: chrome.i18n.getMessage("arpal") },
          ],
        });
      }
    } else if (key === "settings" && newValue) {
      if (newValue.updateInterval) {
        await chrome.alarms.clear("update status");
        await chrome.alarms.create("update status", {
          periodInMinutes: newValue.updateInterval,
        });
      }
    }
  }
}
