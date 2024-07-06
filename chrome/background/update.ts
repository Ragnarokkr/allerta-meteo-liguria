import type { Status } from "../libs/types/status.ts";
import { titleCase } from "../libs/utils.ts";
import type { ScraperResponse } from "../scraper/libs/types/Scraper.ts";
import { scrape } from "./offscreen.ts";
import { StatusActionIcons } from "./setup.ts";

/**
 * Sets the status of the application based on the provided ScraperResponse.
 *
 * @param {ScraperResponse} response - The response from the scraper.
 * @return {Promise<void>} A promise that resolves when the status is set.
 */
async function setStatus(response: ScraperResponse): Promise<void> {
  if (response.success) {
    const newStatus: Status = {
      actionIcon: response.response.alert
        ? StatusActionIcons[response.response.alert]
        : StatusActionIcons.error,
      actionText: chrome.i18n.getMessage("updateAsOf", [
        new Date(response.response.date).toLocaleString(),
        titleCase`${response.response.risk}`,
      ]),
      lastUpdate: response.response,
    };
    await chrome.storage.local.set({ status: newStatus });
  } else {
    const currentStatus: Status = (await chrome.storage.local.get("status"))
      .status;
    await chrome.storage.local.set({
      status: {
        ...currentStatus,
        actionIcon: StatusActionIcons.error,
        actionText: chrome.i18n.getMessage("serviceUnavailable"),
      },
    });
  }
}

/**
 * Updates the status of the application by fetching data from the specified web page,
 * updating the status in the local storage, and setting the appropriate action icon
 * and action text. If an error occurs during the process, it sets the status to an error
 * state.
 *
 * @return {Promise<void>} A promise that resolves when the update is complete.
 */
export async function update(): Promise<void> {
  try {
    const currentStatus: Status = (await chrome.storage.local.get("status"))
      .status;
    await chrome.storage.local.set({
      status: {
        ...currentStatus,
        actionIcon: StatusActionIcons.update,
        actionText: chrome.i18n.getMessage("updating"),
      },
    });
    const { alertWebPage } = (await chrome.storage.local.get("settings"))
      .settings;
    const query = await scrape(alertWebPage);
    await setStatus(query);
  } catch (err) {
    const currentStatus = chrome.storage.local.get("status");
    await chrome.storage.local.set({
      status: {
        ...currentStatus,
        actionIcon: StatusActionIcons.error,
        actionText: chrome.i18n.getMessage("serviceUnavailable"),
      },
    });
    console.error(err);
  }
}
