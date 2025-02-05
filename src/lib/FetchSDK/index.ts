import { FetchApiService } from "../fetch";
import { AuthClient } from "./services/AuthClient";
import { DogClient } from "./services/DogClient";
import { LocationClient } from "./services/LocationClient";

export class FetchInternalSDK {
  private base_url: string;
  private internalFetchClient: FetchApiService;

  DogClient: DogClient;
  LocationClient: LocationClient;
  AuthClient: AuthClient;

  /**
   * @param url - Base URL for the SDK. If not provided, we call {@link getBaseURL}
   */
  constructor(url?: string) {
    this.base_url = url ?? FetchInternalSDK.getBaseURL();
    // Create fetch client
    this.internalFetchClient = new FetchApiService(this.base_url);
    // Assign services
    this.DogClient = new DogClient(this.internalFetchClient);
    this.AuthClient = new AuthClient(this.internalFetchClient);
    this.LocationClient = new LocationClient(this.internalFetchClient);
  }

  // getBaseURL is defined functionally to allow supplying different base urls
  // in case of development server or using different servers for different regions etc...
  // in this case we only return the provided base url but we can refactor in the future
  private static getBaseURL() {
    return "https://frontend-take-home-service.fetch.com";
  }
}
