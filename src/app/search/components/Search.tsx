"use client";
import { Button } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Butcherman } from "next/font/google";
import { ComponentProps, FC, useCallback, useEffect, useState } from "react";

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

const getFavoritesFromCookie = () => {
  return JSON.parse(Cookies.get("favorites") ?? "[]") as string[];
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavoritesFromCookie());
  }, []);

  const updateFavorites = useCallback((dogIds: string[]) => {
    Cookies.set("favorites", JSON.stringify(dogIds));
    setFavorites(dogIds);
  }, []);

  const toggleFavoriteState = useCallback(
    (id: string) => {
      if (favorites.includes(id)) {
        updateFavorites(favorites.filter((favIds) => favIds !== id));
      } else {
        updateFavorites([...favorites, id]);
      }
    },
    [favorites, updateFavorites],
  );

  return { favorites, updateFavorites, toggleFavoriteState };
};

export const Search = () => {
  const [formState, setFormState] = useState<FormStateType>();
  const { dogs, total } = useDogResults(formState);

  const { favorites, toggleFavoriteState } = useFavorites();

  const onPress = () => {
    console.log("matching dog from favorites");
    FetchSDKClient.DogClient.getDogMatch(favorites).then((data) =>
      console.log(data),
    );
  };

  return (
    <div>
      <SearchForm updateSearchState={setFormState} total={total} />
      <Button
        onPress={onPress}
        isDisabled={!favorites || !favorites.length}
        color="success"
      >
        Match dog
      </Button>
      <SearchResults
        dogs={dogs ?? []}
        favorites={favorites}
        toggleFavoriteState={toggleFavoriteState}
      />
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
