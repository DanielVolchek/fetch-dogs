import { Maybe } from "./types"

type FetchOptionsType = Parameters<typeof fetch>[1]

export const BASE_URL = "https://frontend-take-home-service.fetch.com"

export const internalFetch = async <T = void>(url: string, options?: FetchOptionsType): Maybe<T> => {
  
}
