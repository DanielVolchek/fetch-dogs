import { Form } from "@heroui/react";
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

import { DogSortOptions } from "@/lib/FetchSDK/services/DogClient";
import { SortDir, SortFilter } from "@/lib/types";

import { AgeFilters } from "./AgeFilters";
import { BreedFilter } from "./BreedFilter";
import { PaginationComponent } from "./PaginationGroup";
import { SortComponent } from "./SortFilter";

// Search Form provides the filters and search page

type PropsType = {
  updateSearchState: (formStateType: FormStateType) => void;
  total: number;
};

const parseSort = <T extends string>(sort: SortFilter<T>) => {
  const sortSplit = sort?.split(":") as [T, SortDir];
  if (sortSplit && sortSplit[0] && sortSplit[1]) {
    return sortSplit;
  }

  return parseSort(DEFAULT_FORM_STATE.sort);
};

export type FormStateType = {
  breed: string;
  page: number;
  sort: SortFilter<DogSortOptions>;
  perPage: number;
  minAge: number | null;
  maxAge: number | null;
};

export const DEFAULT_FORM_STATE: FormStateType = {
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
    // @ts-ignore
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
