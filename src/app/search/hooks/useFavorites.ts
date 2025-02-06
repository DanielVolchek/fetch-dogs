import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";

import { FetchSDKClient } from "@/lib/FetchSDK/client";

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

export const useMatch = (favorites: string[]) => {
  const [matching, setMatching] = useState(false);
  const query = useQuery({
    queryKey: ["match", matching, favorites],
    queryFn: async () => {
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
