import { FC } from "react";

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
    <>
      {dogs.map((dog) => (
        <DogCard
          key={dog.id}
          dog={dog}
          favorite={favorites.includes(dog.id)}
          toggleFavoriteState={() => toggleFavoriteState(dog.id)}
        />
      ))}
    </>
  );
};
