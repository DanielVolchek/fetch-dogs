import Cookies from "js-cookie";
import { FC, useCallback, useEffect, useState } from "react";

import { Dog } from "@/lib/FetchSDK/models";

import { DogCard } from "./DogCard";

type PropsType = {
  dogs: Dog[];
};

const getFavoritesFromCookie = () => {
  return JSON.parse(Cookies.get("favorites") ?? "[]") as string[];
};

const useFavorites = () => {
  const [favorites, setFavorites] = useState(getFavoritesFromCookie());

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

export const SearchResults: FC<PropsType> = (props) => {
  const { dogs } = props;

  const { favorites, toggleFavoriteState } = useFavorites();

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
