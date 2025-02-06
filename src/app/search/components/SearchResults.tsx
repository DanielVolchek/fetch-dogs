import { FC } from "react";

import { Dog } from "@/lib/FetchSDK/models";

import { DogCard } from "./DogCard";

type PropsType = {
  dogs: Dog[];
};

export const SearchResults: FC<PropsType> = (props) => {
  const { dogs } = props;

  return (
    <div>
      {dogs.map((dog) => (
        <DogCard key={dog.id} dog={dog} />
      ))}
    </div>
  );
};
