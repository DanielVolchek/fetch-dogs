import { internalFetch } from "../fetch";
import { Maybe } from "../types";
import { FetchSDKClient } from "./client";

type FetchType<T> =
  | {
      result: T;
      error: null;
    }
  | {
      result: null;
      error: {
        status: number;
        message: string;
      };
    };

export class FetchSDK {
  private base_url: string;

  /**
   * @param url - Base URL for the SDK. If not provided, we call {@link getBaseURL}
   */
  constructor(url?: string) {
    this.base_url = url ?? FetchSDK.getBaseURL();
  }

  private async internalFetch<T = void>(
    path?: string,
    options?: RequestInit,
  ): Promise<FetchType<T>> {
    try {
      // TODO default options object and merge
      const _options: RequestInit = { credentials: "include", ...options };

      const res = await fetch(`${this.base_url}/${path}`, _options);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }

      const data = (await res.json()) as T;
      return { result: data, error: null };
    } catch (err) {
      return { result: null, error: { status: 400, message: `${err}` } };
    }
  }

  // getBaseURL is defined functionally to allow supplying different base urls
  // in case of development server or using different servers for different regions etc...
  // in this case we only return the provided base url but we can refactor in the future
  private static getBaseURL() {
    return "https://frontend-take-home-service.fetch.com";
  }

  async login(name: string, email: string) {
    return await this.internalFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ name, email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async logout() {
    return await this.internalFetch("/auth/logout", {
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
type SortFilter<T extends string> = `${T}:${"asc" | "desc"}`;

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
