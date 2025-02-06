import {
  Autocomplete,
  AutocompleteItem,
  Form,
  Input,
  Pagination,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

const parseSort = <T extends string>(sort: SortFilter<T>) => {
  return sort.split(":") as [T, SortDir];
};

export type FormStateType = {
  breed: string;
  page: number;
  sort: SortFilter<DogSortOptions>;
  perPage: number;
  minAge: number | null;
  maxAge: number | null;
};

const DEFAULT_FORM_STATE: FormStateType = {
  breed: "",
  page: 1,
  sort: "breed:asc",
  perPage: 25,
  minAge: null,
  maxAge: null,
};

type Options<T> = {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
};

const useStateWithURLUpdate = <T,>(
  key: string,
  initialValue: T,
  options?: Options<T>,
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState(initialValue);
  const searchParams = useSearchParams();

  const { serializer, deserializer } = options ?? {
    serializer: undefined,
    deserializer: undefined,
  };

  const firstRender = useRef(true);

  // On load, set the value from the key
  useEffect(() => {
    if (!searchParams || !firstRender.current) {
      return;
    }

    if (searchParams.has(key)) {
      const value = searchParams.get(key);
      if (!value) {
        return;
      }

      if (deserializer) {
        setState(() => deserializer(value));
      } else {
        setState(() => value as T);
      }
    }

    firstRender.current = false;
  }, [searchParams, deserializer, key]);

  useEffect(() => {
    let value: string | null = null;
    if (serializer) {
      value = serializer(state);
    } else {
      if (state) {
        value = state.toString();
      }
    }
    updateURLState(key, value);
  }, [state, serializer, searchParams, key]);

  return [state, setState];
};

const updateURLState = (name: string, value: string | null) => {
  const params = new URLSearchParams(window.location.search);
  const newParams = new URLSearchParams(params.toString());
  if (
    !value ||
    (DEFAULT_FORM_STATE[name] && value === DEFAULT_FORM_STATE[name].toString())
  ) {
    newParams.delete(name);
  } else {
    newParams.set(name, value);
  }

  window.history.pushState(null, "", `?${newParams.toString()}`);
};

const toString = <T extends number | string | null>(value: T): string => {
  if (value) {
    return value.toString();
  }
  return "";
};

const NumberSerializer = {
  serializer: toString,
  deserializer: (value: string) => parseInt(value),
};

export const useSearchFormState = (
  updateSearchState: PropsType["updateSearchState"],
) => {
  const [breed, setBreed] = useStateWithURLUpdate(
    "breed",
    DEFAULT_FORM_STATE.breed,
  );
  const [sort, setSort] = useStateWithURLUpdate(
    "sort",
    DEFAULT_FORM_STATE.sort,
  );
  const [page, setPage] = useStateWithURLUpdate(
    "page",
    DEFAULT_FORM_STATE.page,
    NumberSerializer,
  );
  const [perPage, setPerPage] = useStateWithURLUpdate(
    "perPage",
    DEFAULT_FORM_STATE.perPage,
    NumberSerializer,
  );

  const [minAge, setMinAge] = useStateWithURLUpdate(
    "minAge",
    DEFAULT_FORM_STATE.minAge,
    NumberSerializer,
  );

  const [maxAge, setMaxAge] = useStateWithURLUpdate(
    "maxAge",
    DEFAULT_FORM_STATE.maxAge,
    NumberSerializer,
  );

  const formState = useMemo(
    () => ({
      breed,
      sort,
      page,
      perPage,
      minAge,
      maxAge,
    }),
    [breed, sort, page, perPage, minAge, maxAge],
  );

  useEffect(() => {
    updateSearchState(formState);
  }, [formState, updateSearchState]);

  const updaters = {
    breed: setBreed,
    sort: setSort,
    page: setPage,
    perPage: setPerPage,
    minAge: setMinAge,
    maxAge: setMaxAge,
  };

  return { formState, updaters };
};

export const SearchForm: FC<PropsType> = (props) => {
  const { updateSearchState, total } = props;

  const { formState, updaters } = useSearchFormState(updateSearchState);

  const sort = parseSort(formState.sort as SortFilter<DogSortOptions>);

  return (
    <Form className="w-[3/4]">
      <h2 className="text-4xl">Filters</h2>
      <div className="flex w-full flex-col gap-4">
        <BreedFilter
          onBreedChange={(breed) => {
            updaters.breed(breed);
            updaters.page(1);
          }}
          breed={formState.breed}
        />
        <AgeFilters
          minAge={formState.minAge}
          maxAge={formState.maxAge}
          setMinAge={updaters.minAge}
          setMaxAge={updaters.maxAge}
        />
        <SortComponent
          sortField={sort[0]}
          sortDirection={sort[1]}
          updateSort={updaters.sort}
        />
      </div>
      {total && (
        <PaginationComponent
          total={total}
          itemsPerPage={formState.perPage}
          page={formState.page}
          onPaginationMove={updaters.page}
          onItemsPerPageChange={(perPage) => {
            updaters.perPage(perPage);
            updaters.page(1);
          }}
        />
      )}
    </Form>
  );
};

type AgeFilterProps = {
  minAge: number | null;
  maxAge: number | null;
  setMinAge: (age: number | null) => void;
  setMaxAge: (age: number | null) => void;
};

const AgeFilters: FC<AgeFilterProps> = (props) => {
  const { maxAge, minAge, setMaxAge, setMinAge } = props;

  const onValueChange = (val: string) => {
    let numVal;
    try {
      numVal = parseInt(val);
      return Math.max(numVal, 0);
    } catch {
      return null;
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        label="Min Age"
        placeholder="Set Min Age"
        labelPlacement="outside"
        value={minAge?.toString()}
        onValueChange={(val) => setMinAge(onValueChange(val))}
      />
      <Input
        type="number"
        label="Max Age"
        placeholder="Set Max Age"
        labelPlacement="outside"
        value={maxAge?.toString()}
        onValueChange={(val) => setMaxAge(onValueChange(val))}
      />
    </div>
  );
};

// TODO make this component allow filtering by multiple values
type BreedFilterProps = {
  breed: string;
  onBreedChange: (breed: string) => void;
};

const BreedFilter: FC<BreedFilterProps> = (props) => {
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

  const lastSortValue = useRef<string>("breed");

  return (
    <div>
      <label
        className="text-(--foreground) text-[14px] font-[500]"
        htmlFor={"#sortBox"}
      >
        Sort By...
      </label>
      <div className="flex gap-2" id="#sortBox">
        <Select
          placeholder="Select sort"
          selectedKeys={[sortField]}
          onSelectionChange={(key) => {
            console.log("sortfield ", sortField);
            if (key.currentKey == null) {
              updateSort(`${lastSortValue.current}:${sortDirection}`);
            } else {
              updateSort(`${key.currentKey}:${sortDirection}`);
              lastSortValue.current = key.currentKey;
            }
          }}
        >
          {sortFields.map((sort) => (
            <SelectItem key={sort.key}>{sort.label}</SelectItem>
          ))}
        </Select>

        <Tabs
          aria-label="Sort direction"
          color="primary"
          selectedKey={sortDirection}
          onSelectionChange={(key) => updateSort(`${sortField}:${key}`)}
        >
          <Tab key="asc" title="Ascending"></Tab>
          <Tab key="desc" title="Descending"></Tab>
        </Tabs>
      </div>
    </div>
  );
};

type PaginationComponentProps = {
  page: number;
  onPaginationMove: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (newItemsPerPage: number) => void;
  total: number;
};

const PaginationComponent: FC<PaginationComponentProps> = (props) => {
  const { page, onPaginationMove, itemsPerPage, onItemsPerPageChange, total } =
    props;

  return (
    <div className="w-full">
      <p>Total: {total}</p>
      <div>
        <Pagination
          page={page}
          onChange={onPaginationMove}
          total={Math.ceil(total / itemsPerPage)}
          showControls
        />
      </div>

      <Select
        className="mt-4"
        label="Items Per Page"
        selectedKeys={[itemsPerPage.toString()]}
        onSelectionChange={(key) =>
          onItemsPerPageChange(
            parseInt(key.anchorKey ?? `${DEFAULT_FORM_STATE.perPage}`),
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
