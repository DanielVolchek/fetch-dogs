import { FetchApiService } from "@/lib/fetch";

export type AuthRoutes = "auth/login" | "auth/logout";
export type AuthRouteResponses = {
  "auth/login": void;
  "auth/logout": void;
};

export class AuthClient {
  private fetchService: FetchApiService;

  constructor(fetchService: FetchApiService) {
    this.fetchService = fetchService;
  }

  async login(name: string, email: string) {
    return await this.fetchService.fetch("auth/login", {
      method: "POST",
      body: JSON.stringify({ name, email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async logout() {
    return await this.fetchService.fetch("auth/logout");
  }
}
