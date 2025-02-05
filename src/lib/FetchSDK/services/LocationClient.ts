import { FetchApiService } from "@/lib/fetch";

import { Coordinates } from "../models";
import { BaseClient } from "./BaseClient";

export type LocationRoutes = "/locations" | "/locations/search";

export type LocationRouteResponses = {
  "/locations": Location[];
  "/locations/search": {
    result: Location[];
    total: number;
  };
};

type GeoBoundingBoxType =
  | {
      top: Coordinates;
      left: Coordinates;
      bottom: Coordinates;
      right: Coordinates;
    }
  | { bottom_left: Coordinates; top_right: Coordinates }
  | { bottom_right: Coordinates; top_left: Coordinates };

type GetLocationOptions = {
  // TODO city options (autocomplete with fetch function)
  city: string;
  // TODO same autocomplete with fetch function
  states: string;
  geoBoundingBox: GeoBoundingBoxType;

  size: number;
  from: number;
};

export class LocationClient extends BaseClient {
  async getLocation(zipCodes: string[]) {
    if (zipCodes.length > 100) {
      return {
        result: null,
        error: {
          status: 400,
          message: "Zip codes length must be shorter than 100",
        },
      };
    }

    return await this.fetchService.fetch("/locations", {
      method: "POST",
      body: JSON.stringify(zipCodes),
    });
  }

  async getLocationSearch(body: GetLocationOptions) {
    return await this.fetchService.fetch("/locations/search", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}
