import {
  Autocomplete,
  AutocompleteItem,
  Form,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useCallback, useEffect, useState } from "react";

import { FetchSDKClient } from "@/lib/FetchSDK/client";
import { Dog } from "@/lib/FetchSDK/models";
import {
  DogSortFilter,
  DogSortOptions,
} from "@/lib/FetchSDK/services/DogClient";
import { SortDir, SortFilter } from "@/lib/types";

// Search Form provides the filters and search page

type PropsType = {
  updateDogs: (dogs: Dog[]) => void;
};

const parseSort = <T extends string>(sort: SortFilter<T>) => {
  return sort.split(":") as [T, SortDir];
};

type FormStateType = {
  breed: string | null;
  page: number;
  sort: SortFilter<DogSortOptions>;
};

const DEFAULT_FORM_STATE: FormStateType = {
  breed: "",
  page: 0,
  sort: "breed:desc",
};

export const useSearchFormState = (updateDogs: (dogs: Dog[]) => void) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formState, setFormState] = useState(DEFAULT_FORM_STATE);

  const updateURLState = (name: string, value: string | number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(name);
    } else {
      params.set(name, value.toString());
    }

    window.history.pushState(null, "", `?${params.toString()}`);
  };

  const updateValue = <T extends keyof typeof DEFAULT_FORM_STATE>(
    key: T,
    value: (typeof DEFAULT_FORM_STATE)[T],
  ) => {
    const formStateCopy = { ...formState, key: value };
    setFormState(formStateCopy);
    updateURLState(key, value);
  };

  useEffect(() => {
    let breedArray;
    if (formState.breed) {
      breedArray = [formState.breed];
    }

    const options = {
      sort: formState.sort,
    };

    if (breedArray) {
      options["breeds"] = breedArray;
    }

    const newDogs = FetchSDKClient.DogClient.getDogSearch(options);
  }, [formState]);

  // Load form state from URL
  useEffect(() => {
    // TODO this can be a funtion clean it up
    const nextState = { ...formState };

    if (searchParams.has("breed")) {
      const breed = searchParams.get("breed");
      if (breed) {
        nextState["breed"] = breed;
      }
    }

    if (searchParams.has("page")) {
      const page = searchParams.get("page");
      if (page) {
        nextState["page"] = parseInt(page);
      }
    }

    if (searchParams.has("sort")) {
      const sort = searchParams.get("sort");
      if (sort) {
        nextState["sort"] = sort as SortFilter<DogSortOptions>;
      }
    }

    setFormState({ ...nextState });
  }, [searchParams]);

  return { formState, updateValue };
};

export const SearchForm: FC<PropsType> = (props) => {
  const { updateDogs } = props;

  const { formState, updateValue } = useSearchFormState(updateDogs);

  const sort = parseSort(formState.sort as SortFilter<DogSortOptions>);

  return (
    <Form>
      <h2>dogs</h2>
      <div className="flex w-full flex-wrap gap-4 md:flex-nowrap">
        <BreedFilter
          onBreedChange={(breed) => updateValue("breed", breed)}
          breed={formState.breed}
        />
        <SortComponent
          sortField={sort[0]}
          sortDirection={sort[1]}
          updateSort={(sort) => updateValue("sort", sort)}
        />
      </div>
    </Form>
  );
};

// TODO make this component allow filtering by multiple values

type BreedFilterProps = {
  breed: string | undefined;
  onBreedChange: (breed: string | null) => void;
};

// https://www.heroui.com/docs/components/select#multiple-with-chips
const BreedFilter: FC<BreedFilterProps> = (props) => {
  const { breed, onBreedChange } = props;

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
      selectedKey={breed}
      onSelectionChange={(key) => onBreedChange(key as string)}
    >
      {data?.result
        ? data.result.map((breed) => (
            <AutocompleteItem key={breed}>{breed}</AutocompleteItem>
          ))
        : null}
    </Autocomplete>
  );
};

const sortFields: { key: DogSortOptions; label: string }[] = [
  { key: "breed", label: "Breed" },
  { key: "name", label: "Name" },
  { key: "age", label: "Age" },
];

type SortComponentProps = {
  sortField: DogSortOptions;
  sortDirection: "asc" | "desc";
  updateSort: (sort: DogSortFilter) => void;
};

const SortComponent: FC<SortComponentProps> = (props) => {
  const { sortField, sortDirection, updateSort } = props;

  return (
    <>
      <Select
        label="Sort By..."
        placeholder="Select sort"
        selectedKeys={[sortField]}
        onSelectionChange={(key) => {
          updateSort(`${key.anchorKey}:${sortDirection}`);
        }}
      >
        {sortFields.map((sort) => (
          <SelectItem key={sort.key}>{sort.label}</SelectItem>
        ))}
      </Select>

      <div>
        <p>Sort Direction</p>
        <Tabs
          aria-label="Sort direction"
          color="primary"
          selectedKey={sortDirection}
          onSelectionChange={(key) => updateSort(`${sortField}:${key}`)}
        >
          <Tab key="desc" title="descending"></Tab>
          <Tab key="asc" title="Ascending"></Tab>
        </Tabs>
      </div>
    </>
  );
};

const PaginationComponent = () => {
  return;
};
