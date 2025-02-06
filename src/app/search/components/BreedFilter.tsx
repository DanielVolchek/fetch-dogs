import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";

import { FetchSDKClient } from "@/lib/FetchSDK/client";

import { DEFAULT_FORM_STATE } from "./SearchForm";

type PropsType = {
  breed: string;
  onBreedChange: (breed: string) => void;
};

// Breed filter Autocomplete component
// Unfortunately did not realize at the time of selecting the component library HeroUI that Autocomplete cannot be used for multiple items
// In the future this component would have additional custom logic added to allow for multiple breed filters to better fit the requirements
export const BreedFilter: FC<PropsType> = (props) => {
  const { breed, onBreedChange } = props;

  const { isPending, error, data } = useQuery({
    queryKey: ["breeds"],
    queryFn: () => FetchSDKClient.DogClient.getDogBreeds(),
  });

  return (
    <Autocomplete
      label="Breed"
      placeholder={isPending ? "Loading..." : "Select Breed"}
      labelPlacement="outside"
      isDisabled={isPending || !!error}
      selectedKey={breed}
      onSelectionChange={(key) => {
        onBreedChange((key ?? DEFAULT_FORM_STATE.breed) as string);
      }}
    >
      {data?.result
        ? data.result.map((breed) => (
            <AutocompleteItem key={breed}>{breed}</AutocompleteItem>
          ))
        : null}
    </Autocomplete>
  );
};
