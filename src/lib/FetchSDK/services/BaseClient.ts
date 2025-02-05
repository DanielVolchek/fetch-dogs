import { FetchApiService } from "@/lib/fetch";

export class BaseClient {
  protected fetchService;

  constructor(fetchService: FetchApiService) {
    this.fetchService = fetchService;
  }
}
