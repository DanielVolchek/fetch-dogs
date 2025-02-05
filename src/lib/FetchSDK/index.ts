import { FetchApiService, internalFetch } from "../fetch";
import { Maybe, SortFilter } from "../types";
import { FetchSDKClient } from "./client";

export class FetchInternalSDK {
  private base_url: string;
  private internalFetchClient: FetchApiService;

  /**
   * @param url - Base URL for the SDK. If not provided, we call {@link getBaseURL}
   */
  constructor(url?: string) {
    this.base_url = url ?? FetchInternalSDK.getBaseURL();
    this.internalFetchClient = new FetchApiService(this.base_url);
  }

  // getBaseURL is defined functionally to allow supplying different base urls
  // in case of development server or using different servers for different regions etc...
  // in this case we only return the provided base url but we can refactor in the future
  private static getBaseURL() {
    return "https://frontend-take-home-service.fetch.com";
  }

  async login(name: string, email: string) {
    return await this.internalFetchClient.fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ name, email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async logout() {
    return await this.internalFetchClient.fetch("/auth/logout", {
      method: "POST",
    });
  }

  // TODO create this as a service
  // Move the internal fetch implementation to a service and inject it into all other services
  DogService = {
    getDogBreeds: async () => {
      return await this.internalFetch<string[]>("/dogs/breeds");
    },
    getDogs: async (options: Partial<GetDogsOptions>) => {
      const defaults: typeof options = { size: 25, sort: "breed:asc" };
      const _options = { ...defaults, options };

      return await this.internalFetch();
    },
  };

  LocationService = {
    async getLocationService() {},
  };
}

type QueryFilter = "breed" | "name" | "age";

type GetDogsOptions = {
  breeds: string[];
  zipCodes: number[];
  ageMin: number;
  ageMax: number;
  size: number;
  from: number;
  sort: SortFilter<QueryFilter>;
};

// apis
// /dogs/breeds
// /dogs/search
// /dogs
class DogClient {
  constructor() {}
}
