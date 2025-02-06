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
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
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

type ConstrainedPerPageType = 25 | 50 | 100;

const parseSort = <T extends string>(sort: SortFilter<T>) => {
  return sort.split(":") as [T, SortDir];
};

export type FormStateType = {
  breed: string;
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
    { serializer: toString, deserializer: parseInt },
  );
  const [perPage, setPerPage] = useStateWithURLUpdate<ConstrainedPerPageType>(
    "perPage",
    DEFAULT_FORM_STATE.perPage,
    {
      serializer: toString,
      deserializer: (value: string) =>
        parseInt(value) as ConstrainedPerPageType,
    },
  );

  const formState = useMemo(
    () => ({
      breed,
      sort,
      page,
      perPage,
    }),
    [breed, sort, page, perPage],
  );

  useEffect(() => {
    updateSearchState(formState);
  }, [formState, updateSearchState]);

  const updaters = {
    breed: setBreed,
    sort: setSort,
    page: setPage,
    perPage: setPerPage,
  };

  return { formState, updaters };
};

export const SearchForm: FC<PropsType> = (props) => {
  const { updateSearchState, total } = props;

  const { formState, updaters } = useSearchFormState(updateSearchState);

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
        <BreedFilter onBreedChange={updaters.breed} breed={formState.breed} />
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

// TODO make this component allow filtering by multiple values

type BreedFilterProps = {
  breed: string;
  onBreedChange: (breed: string) => void;
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
    <div className="flex flex-col gap-2">
      <Select
        label="Sort By..."
        labelPlacement="outside"
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
        <Tab key="desc" title="descending"></Tab>
        <Tab key="asc" title="Ascending"></Tab>
      </Tabs>
    </div>
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
        total={Math.floor(total / itemsPerPage)}
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
