import { Maybe } from "../types";

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
      const res = await fetch(`${this.base_url}/${path}`, options);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }

      const data = (await res.json()) as T;
      return data;
    } catch (err) {
      return {};
    }
  }

  // getBaseURL is defined functionally to allow supplying different base urls
  // in case of development server or using different servers for different regions etc...
  // in this case we only return the provided base url but we can refactor in the future
  private static getBaseURL() {
    return "https://frontend-take-home-service.fetch.com";
  }

  login(username: string, password: string) {}
}
