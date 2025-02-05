import { Maybe } from "./types";

type FetchOptionsType = Parameters<typeof fetch>[1];

export const INTERNAL_API_URL = "https://frontend-take-home-service.fetch.com";

export const internalFetch = async <T = void>(
  url: string,
  options?: FetchOptionsType,
): Maybe<T> => {
  const results = await fetch(`${INTERNAL_API_URL}`);
};
