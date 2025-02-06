"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { FetchSDKClient } from "@/lib/FetchSDK/client";
import { GetDogsSearchOptions } from "@/lib/FetchSDK/services/DogClient";

import { FormStateType, SearchForm } from "./SearchForm";
import { SearchResults } from "./SearchResults";

const useDogSearch = (searchState: FormStateType) => {
  const query = useQuery({
    queryKey: [searchState],
    queryFn: ({ queryKey }) => {
      const searchState = queryKey[0];
      const options: Partial<GetDogsSearchOptions> = {};
      if (searchState.breed) {
        options.breeds = [searchState.breed];
      }
      options.sort = searchState.sort;
      options.size = searchState.perPage;
      options.from = (searchState.page - 1) * searchState.perPage;
      return FetchSDKClient.DogClient.getDogSearch(options);
    },
  });

  return query;
};

const useDogList = (dogIds: string[] | undefined) => {
  const query = useQuery({
    queryKey: [dogIds],
    queryFn: ({ queryKey }) => {
      const dogIds = queryKey[0];
      return FetchSDKClient.DogClient.getDogs(dogIds ?? []);
    },
  });

  return query;
};

const useDogResults = (formStateType: FormStateType | undefined) => {
  const dogSearchQuery = useDogSearch(formStateType);
  const dogListQuery = useDogList(dogSearchQuery.data?.result?.resultIds);

  return {
    dogs: dogListQuery.data?.result,
    total: dogSearchQuery.data?.result?.total,
  };
};

export const Search = () => {
  const [formState, setFormState] = useState<FormStateType>();
  const { dogs, total } = useDogResults(formState);

  return (
    <div>
      <SearchForm updateSearchState={setFormState} total={total} />
      <SearchResults dogs={dogs ?? []} />
    </div>
  );
};

// return debounce(async (options: Partial<GetDogsSearchOptions>) => {
//   const dogIds = await FetchSDKClient.DogClient.getDogSearch(options);
//   if (dogIds.result?.resultIds) {
//     console.log("new dog list", dogIds.result.resultIds);
//     const dogs = await FetchSDKClient.DogClient.getDogs(
//       dogIds.result.resultIds,
//     );
//     if (dogs.result) {
//       setDogs(dogs.result);
//     }
//   }
// }, 500);
