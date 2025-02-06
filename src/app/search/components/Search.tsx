"use client";
import { Button, Spinner, Tooltip } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FetchSDKClient } from "@/lib/FetchSDK/client";
import { GetDogsSearchOptions } from "@/lib/FetchSDK/services/DogClient";

import { FormStateType, SearchForm } from "./SearchForm";
import { SearchResults } from "./SearchResults";
import { SelectedDogModal } from "./SelectedDogModal";

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

const useDogResults = (formStateType: FormStateType | undefined) => {
  const dogSearchQuery = useDogSearch(formStateType);
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

const getFavoritesFromCookie = () => {
  return JSON.parse(Cookies.get("favorites") ?? "[]") as string[];
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

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

  return {
    favorites,
    updateFavorites,
    toggleFavoriteState,
    showOnlyFavorites,
    setShowOnlyFavorites,
  };
};

const useMatch = (favorites: string[]) => {
  const [matching, setMatching] = useState(false);
  const query = useQuery({
    queryKey: ["match", matching, favorites],
    queryFn: async ({ queryKey }) => {
      console.log("query fn");
      console.log("query key is ", queryKey);

      const dogMatchQuery =
        await FetchSDKClient.DogClient.getDogMatch(favorites);

      if (dogMatchQuery.error) {
        throw new Error(dogMatchQuery.error.message);
      }

      const getDogQuery = await FetchSDKClient.DogClient.getDogs([
        dogMatchQuery.result.match,
      ]);

      if (getDogQuery.error) {
        throw new Error(getDogQuery.error.message);
      }

      return getDogQuery.result;
    },
    enabled: matching,
    staleTime: Infinity,
  });

  return { matching, setMatching, query };
};

type MatchDogProps = {
  onPress: () => void;
  isDisabled: boolean;
  color: "success" | "danger";
  label: string;
};

const MatchDogButton: FC<MatchDogProps> = (props) => {
  const { onPress, isDisabled, label, color } = props;
  const [mousedOver, setMousedOver] = useState(false);

  const onMouseOver = () => {
    setMousedOver(true);
  };

  const onMouseOut = () => {
    setMousedOver(false);
  };

  return (
    <Tooltip
      content="Add a dog to your favorites to get started"
      color="foreground"
      isOpen={isDisabled && mousedOver}
      showArrow
    >
      <span
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        className="w-full"
      >
        <Button
          onPress={onPress}
          isDisabled={isDisabled}
          color={color}
          className="mt-4 w-full"
        >
          {label}
        </Button>
      </span>
    </Tooltip>
  );
};

export const Search = () => {
  const [formState, setFormState] = useState<FormStateType>();
  const { dogs, total, isPending } = useDogResults(formState);

  const { favorites, toggleFavoriteState, updateFavorites } = useFavorites();

  const { matching, setMatching, query: matchQuery } = useMatch(favorites);

  const onPressMatch = () => {
    console.log("matching");
    setMatching(true);
  };

  const onPressReset = () => {
    updateFavorites([]);
  };

  return (
    <div>
      <div className="lg:flex">
        <div className="top-8 box-content h-full w-full px-8 lg:sticky lg:w-[25vw]">
          <SearchForm updateSearchState={setFormState} total={total} />
          <div className="flex gap-2">
            <MatchDogButton
              onPress={onPressMatch}
              isDisabled={!favorites || !favorites.length}
              label="Match with a Dog"
              color="success"
            />
            <MatchDogButton
              onPress={onPressReset}
              isDisabled={!favorites || !favorites.length}
              label="Reset Favorites"
              color="danger"
            />
          </div>
        </div>
        <div className="flex-2 flex w-full flex-wrap justify-center gap-8 lg:justify-normal">
          {isPending ? (
            <Spinner className="mx-auto" />
          ) : (
            <SearchResults
              dogs={dogs ?? []}
              favorites={favorites}
              toggleFavoriteState={toggleFavoriteState}
            />
          )}
        </div>

        {matching && (
          <SelectedDogModal
            match={matchQuery.data ? matchQuery.data[0] : undefined}
            onClose={() => setMatching(false)}
            isPending={matchQuery.isPending}
          />
        )}
      </div>
    </div>
  );
};
