"use client";
import { Spinner } from "@heroui/react";
import { useState } from "react";

import { useDogResults } from "../hooks/useDogHooks";
import { useFavorites, useMatch } from "../hooks/useFavorites";
import { MatchDogButton } from "./MatchDogButton";
import { FormStateType, SearchForm } from "./SearchForm";
import { SearchResults } from "./SearchResults";
import { SelectedDogModal } from "./SelectedDogModal";

export const Search = () => {
  const [formState, setFormState] = useState<FormStateType>();
  const { dogs, total, isPending } = useDogResults(formState);

  const { favorites, toggleFavoriteState, updateFavorites } = useFavorites();
  const { matching, setMatching, query: matchQuery } = useMatch(favorites);

  const onPressMatch = () => {
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
          <div className="mt-4 flex gap-2">
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
