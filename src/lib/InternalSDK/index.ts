import { Maybe } from "../types";

export class FetchSDK {
  private base_url: string;

  /**
   * @param url - Base URL for the SDK. If not provided, we call {@link getBaseURL}
   */
  constructor(url?: string) {
    this.base_url = url ?? FetchSDK.getBaseURL()
  }

  private async internalFetch<T = void>(path?: string, options?: RequestInit): Promise<Maybe<T>> {
    try {
      const res = await fetch(`${this.base_url}/${path}`, options)
      const data = await res.json() as T;
    } catch (err) {

    }
  }

  // getBaseURL is defined functionally to allow supplying different base urls
  // in case of development server or using different servers for different regions etc...
  // in this case we only return the provided base url but we can refactor in the future
  private static getBaseURL(){
    return "https://frontend-take-home-service.fetch.com"
  }

  login(username: string, password: string){
        
  }
}
