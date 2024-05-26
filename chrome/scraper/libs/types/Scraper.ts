import type { StatusLastUpdate } from "../../../libs/types/status.ts";

export type ScraperSuccessResponse = {
  target: "serviceworker";
  success: true;
  response: StatusLastUpdate;
};

export type ScraperErrorResponse = {
  target: "serviceworker";
  success: false;
  error: string;
};

export type ScraperResponse = ScraperSuccessResponse | ScraperErrorResponse;
