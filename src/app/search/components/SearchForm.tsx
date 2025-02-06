import { Autocomplete, AutocompleteItem, Form } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { FetchInternalSDK } from "@/lib/FetchSDK";
import { FetchSDKClient } from "@/lib/FetchSDK/client";

// Search Form provides the filters and search page

export const SearchForm = () => {
  return (
    <Form>
      <h2>dogs</h2>
      <div className="flex w-full flex-wrap gap-4 md:flex-nowrap">
        <BreedFilter />
      </div>
    </Form>
  );
};

const SearchField = () => {};

// TODO make this component allow filtering by multiple values
const BreedFilter = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["breeds"],
    queryFn: () => FetchSDKClient.DogClient.getDogBreeds(),
  });

  return (
    <Autocomplete
      className="max-w-xs"
      label="Breed"
      placeholder={isPending ? "Loading..." : "Select Breed"}
      labelPlacement="outside"
      isDisabled={isPending || !!error}
    >
      {data?.result
        ? data.result.map((breed) => (
            <AutocompleteItem key={breed}>{breed}</AutocompleteItem>
          ))
        : null}
    </Autocomplete>
  );
};

const PaginationComponent = () => {};
