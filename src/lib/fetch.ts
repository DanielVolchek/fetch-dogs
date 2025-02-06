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
    options?: RequestInit & { params?: Record<string, string> },
  ): Promise<FetchType<T>> => {
    try {
      const defaultOptions = { credentials: "include" } as const;
      const _options: typeof options = { ...defaultOptions, ...options };

      const url = new URL(path, this.base_url);

      for (const [key, value] of Object.entries(_options.params ?? {})) {
        if (Array.isArray(value)) {
          // Join the array values with '&' and append them as a single string
          const joinedValues = value.join("&");
          url.searchParams.append(key, joinedValues);
        } else {
          // Append non-array values directly
          url.searchParams.append(key, value);
        }
      }

      const res = await fetch(url.toString(), _options);

      if (!res.ok) {
        if (res.status === 401) {
          if (typeof window !== "undefined") {
            window.location.replace("/");
          }
        }

        return {
          result: null,
          error: {
            status: res.status,
            // TODO add error message
            message: `Error: Request Failed`,
          },
        };
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = (await res.json()) as T;
        return { result: data, error: null };
      }

      return { result: (await res.text()) as T, error: null };
    } catch (err) {
      return { result: null, error: { status: 400, message: `${err}` } };
    }
  };
}
