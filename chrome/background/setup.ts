import type {
  IconDescriptor,
  StatusActionIcon,
  StatusActionIconEnums,
} from "../libs/types/icons.ts";
import type { Settings } from "../libs/types/settings.ts";
import type { Status } from "../libs/types/status.ts";

export const StatusActionIcons: StatusActionIconEnums = {
  green: "green",
  yellow: "yellow",
  orange: "orange",
  red: "red",
  update: "update",
  error: "error",
} as const;

export function createIconDescriptor(icon: StatusActionIcon): IconDescriptor {
  return new Map([
    [16, `/assets/icons/${icon}-16.png`],
    [24, `/assets/icons/${icon}-24.png`],
    [32, `/assets/icons/${icon}-32.png`],
  ]);
}

export const defaultSettings: Settings = {
  alertWebPage: "https://allertaliguria.regione.liguria.it",
  arpalWebPage: "https://www.arpal.liguria.it/tematiche/meteo.html",
  updateInterval: 10,
};

export const defaultStatus: Status = {
  actionIcon: StatusActionIcons.update,
  actionText: chrome.i18n.getMessage("updating"),
  lastUpdate: {
    alert: "",
    risk: "",
    info: "",
    date: 0,
    links: {
      alert: "",
      forecast: "",
      map: "",
    },
  },
};
