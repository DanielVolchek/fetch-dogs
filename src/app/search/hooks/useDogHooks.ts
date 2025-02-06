import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";

import { FetchSDKClient } from "@/lib/FetchSDK/client";
import { GetDogsSearchOptions } from "@/lib/FetchSDK/services/DogClient";

import { DEFAULT_FORM_STATE, FormStateType } from "../components/SearchForm";

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
      if (searchState.minAge) {
        options.ageMin = searchState.minAge;
      }
      if (searchState.maxAge) {
        options.ageMax = searchState.maxAge;
      }
      return FetchSDKClient.DogClient.getDogSearch(options);
    },
    staleTime: 60000,
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

export const useDogResults = (formStateType: FormStateType | undefined) => {
  const dogSearchQuery = useDogSearch(formStateType ?? DEFAULT_FORM_STATE);
  const dogListQuery = useDogList(dogSearchQuery.data?.result?.resultIds);

  const isPending = dogSearchQuery.isPending || dogListQuery.isPending;

  const oldTotalValue = useRef(0);
  const total = useMemo(() => {
    const newTotalValue = dogSearchQuery.data?.result?.total;
    if (newTotalValue == undefined) {
      if (oldTotalValue.current) {
        return oldTotalValue.current;
      }

      return 0;
    }

    oldTotalValue.current = newTotalValue;
    return newTotalValue;
  }, [dogSearchQuery.data?.result?.total]);

  return {
    isPending,
    dogs: dogListQuery.data?.result,
    total,
  };
};
