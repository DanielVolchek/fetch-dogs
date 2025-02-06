import {
  Autocomplete,
  AutocompleteItem,
  Form,
  Pagination,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { u } from "framer-motion/client";
import { useSearchParams } from "next/navigation";
import { parse } from "path";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FetchSDKClient } from "@/lib/FetchSDK/client";
import {
  DogSortFilter,
  DogSortOptions,
} from "@/lib/FetchSDK/services/DogClient";
import { SortDir, SortFilter } from "@/lib/types";

// Search Form provides the filters and search page

type PropsType = {
  updateSearchState: (formStateType: FormStateType) => void;
  total: number;
};

type ConstrainedPerPageType = 25 | 50 | 100;

const parseSort = <T extends string>(sort: SortFilter<T>) => {
  return sort.split(":") as [T, SortDir];
};

export type FormStateType = {
  breed: string | null;
  page: number;
  sort: SortFilter<DogSortOptions>;
  perPage: ConstrainedPerPageType;
};

const DEFAULT_FORM_STATE: FormStateType = {
  breed: "",
  page: 1,
  sort: "breed:desc",
  perPage: 25,
};

export const useSearchFormState = (
  updateSearchState: PropsType["updateSearchState"],
) => {
  const searchParams = useSearchParams();

  const [formState, setFormState] = useState(DEFAULT_FORM_STATE);

  useEffect(() => {
    updateSearchState(formState);
    console.log("Formstate changed", formState);
  }, [updateSearchState, formState]);

  const updateURLState = useCallback(
    (name: string, value: string | number | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value) {
        params.delete(name);
      } else {
        params.set(name, value.toString());
      }

      window.history.pushState(null, "", `?${params.toString()}`);
    },
    [searchParams],
  );

  const updateValue = useCallback(
    <T extends keyof typeof DEFAULT_FORM_STATE>(
      key: T,
      value: (typeof DEFAULT_FORM_STATE)[T],
    ) => {
      setFormState((prevFormState) => {
        const updatedFormState = { ...prevFormState, [key]: value };
        updateURLState(key, value);
        return updatedFormState;
      });
    },
    [updateURLState],
  );

  useEffect(() => {
    console.log("formstate changed");
  }, [formState.perPage]);

  useMemo(() => {
    console.log("formstate per page changed", formState.perPage);
  }, [formState.perPage]);

  useEffect(() => {
    console.log("calling perpage use effect");
    updateValue("page", 1);
  }, [formState.perPage]);

  // Load form state from URL
  useEffect(() => {
    // TODO this can be a funtion clean it up
    const nextState = { ...formState };

    const updateBySearchParam = <T extends keyof FormStateType>(
      key: T,
      int?: boolean,
    ) => {
      if (searchParams.has(key)) {
        let value: string | number | null = searchParams.get(key);

        console.log(key, value);

        if (value) {
          if (int) {
            value = parseInt(value);
          }
          nextState[key] = value as FormStateType[T];
        }
      }
    };

    updateBySearchParam("breed");
    updateBySearchParam("page", true);
    updateBySearchParam("sort");
    updateBySearchParam("perPage", true);

    setFormState({ ...nextState });
  }, []);

  return { formState, updateValue };
};

export const SearchForm: FC<PropsType> = (props) => {
  const { updateSearchState, total } = props;

  const { formState, updateValue } = useSearchFormState(updateSearchState);

  const sort = parseSort(formState.sort as SortFilter<DogSortOptions>);

  useEffect(() => {
    console.log("component loaded for the first time");
  }, []);

  useEffect(() => {
    console.log("per page changed");
  }, [formState.perPage]);

  return (
    <Form>
      <h2>Filters</h2>
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
      {total && (
        <PaginationComponent
          total={total}
          itemsPerPage={formState.perPage}
          page={formState.page}
          onPaginationMove={(page) => updateValue("page", page)}
          onItemsPerPageChange={(perPage) => {
            updateValue("perPage", perPage);
          }}
        />
      )}
    </Form>
  );
};

// TODO make this component allow filtering by multiple values

type BreedFilterProps = {
  breed: string | null;
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
      onSelectionChange={(key) => {
        console.log("key changed to ", key);
        onBreedChange(key as string);
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

type PaginationComponentProps = {
  page: number;
  onPaginationMove: (page: number) => void;
  itemsPerPage: 25 | 50 | 100;
  onItemsPerPageChange: (newItemsPerPage: ConstrainedPerPageType) => void;
  total: number;
};

const PaginationComponent: FC<PaginationComponentProps> = (props) => {
  const { page, onPaginationMove, itemsPerPage, onItemsPerPageChange, total } =
    props;

  return (
    <div>
      <Pagination
        page={page}
        onChange={onPaginationMove}
        total={Math.floor(total / itemsPerPage) || 1000}
      />

      <Select
        label="Items Per Page"
        selectedKeys={[itemsPerPage.toString()]}
        onSelectionChange={(key) =>
          onItemsPerPageChange(
            parseInt(key.anchorKey ?? "25") as ConstrainedPerPageType,
          )
        }
      >
        <SelectItem key={"25"}>25</SelectItem>
        <SelectItem key={"50"}>50</SelectItem>
        <SelectItem key={"100"}>100</SelectItem>
      </Select>
    </div>
  );
};
