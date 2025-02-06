import { FetchApiService } from "@/lib/fetch";
import { SortFilter } from "@/lib/types";

import { Dog } from "../models";
import { BaseClient } from "./BaseClient";

export type DogRoutes = "dogs/breeds" | "dogs/search" | "dogs" | "dogs/match";

export type DogRouteResponses = {
  "dogs/breeds": string[];
  "dogs/search": {
    resultIds: string[];
    total: number;
    next: number;
    prev: number;
  };
  dogs: Dog[];
  "dogs/match": Dog;
};

export type DogSortOptions = "breed" | "name" | "age";
export type DogSortFilter = SortFilter<DogSortOptions>;

export type GetDogsSearchOptions = {
  breeds: string[];
  zipCodes: number[];
  ageMin: number;
  ageMax: number;
  size: number;
  from: number;
  sort: DogSortFilter;
};

export class DogClient extends BaseClient {
  async getDogBreeds() {
    return await this.fetchService.fetch("dogs/breeds");
  }

  async getDogs(dogs: string[]) {
    if (dogs.length > 100) {
      return {
        result: null,
        error: {
          status: 400,
          message: "Dogs id array length must be less than 100",
        },
      };
    }

    return await this.fetchService.fetch("dogs", {
      method: "POST",
      body: JSON.stringify(dogs),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // TODO
  // In the future this can be updated to have more of a direct sdk approach to search
  async getDogMatch(dogs: string[]) {
    return await this.fetchService.fetch("dogs/match", {
      method: "POST",
      body: JSON.stringify(dogs),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getDogSearch(options: Partial<GetDogsSearchOptions>) {
    return await this.fetchService.fetch("dogs/search", {
      params: options as Record<string, string>,
    });
  }
}
