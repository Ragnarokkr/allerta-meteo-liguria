import type { StatusActionIcon } from "./icons.ts";

export type StatusActionText = string;

export interface StatusLastUpdate {
  alert: string;
  risk: string;
  info: string;
  date: number;
  links: {
    alert: string;
    forecast: string;
    map: string;
  };
}
export interface Status {
  actionIcon: StatusActionIcon;
  actionText: StatusActionText;
  lastUpdate: StatusLastUpdate;
}
