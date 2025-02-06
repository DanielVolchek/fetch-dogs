import { FC, useCallback, useEffect, useState } from "react";

import { Dog } from "@/lib/FetchSDK/models";

import { DogCard } from "./DogCard";

type PropsType = {
  dogs: Dog[];
  favorites: string[];
  toggleFavoriteState: (id: string) => void;
};

export const SearchResults: FC<PropsType> = (props) => {
  const { dogs, favorites, toggleFavoriteState } = props;

  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      {dogs.map((dog) => (
        <DogCard
          key={dog.id}
          dog={dog}
          favorite={favorites.includes(dog.id)}
          toggleFavoriteState={() => toggleFavoriteState(dog.id)}
        />
      ))}
    </div>
  );
};
