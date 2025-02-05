import { Dog } from "./FetchSDK/models";
import { AuthRouteResponses, AuthRoutes } from "./FetchSDK/services/AuthClient";
import { DogRouteResponses, DogRoutes } from "./FetchSDK/services/DogClient";
import {
  LocationRouteResponses,
  LocationRoutes,
} from "./FetchSDK/services/LocationClient";

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

type InternalAPIPaths = AuthRoutes | DogRoutes | LocationRoutes;

type InternalResponseType = AuthRouteResponses &
  DogRouteResponses &
  LocationRouteResponses;

export class FetchApiService {
  private base_url: string;

  constructor(url: string) {
    this.base_url = url;
  }

  fetch = async <
    TPath extends InternalAPIPaths = InternalAPIPaths,
    T = InternalResponseType[TPath],
  >(
    path: TPath,
    options?: RequestInit & { params?: Record<string, unknown> },
  ): Promise<FetchType<T>> => {
    try {
      const defaultOptions = { credentials: "include" } as const;
      const _options: typeof options = { ...defaultOptions, ...options };

      const url = new URL(this.base_url, path);

      for (const [key, value] of Object.entries(_options.params ?? {})) {
        url.searchParams.append(key, JSON.stringify(value));
      }

      const res = await fetch(`${this.base_url}/${path}`, _options);

      if (!res.ok) {
        return {
          result: null,
          error: {
            status: res.status,
            // TODO add error message
            message: `${"error message here TODO"}`,
          },
        };
      }

      // const contentType = res.headers.get("content-type");
      // if (contentType && contentType.includes("application/json")) {
      // }

      const data = (await res.json()) as T;
      return { result: data, error: null };
    } catch (err) {
      return { result: null, error: { status: 400, message: `${err}` } };
    }
  };
}
