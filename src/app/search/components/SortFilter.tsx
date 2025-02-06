import { Select, SelectItem, Tab, Tabs } from "@heroui/react";
import { FC, useRef } from "react";

import {
  DogSortFilter,
  DogSortOptions,
} from "@/lib/FetchSDK/services/DogClient";

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

export const SortComponent: FC<SortComponentProps> = (props) => {
  const { sortField, sortDirection, updateSort } = props;
  const lastSortValue = useRef<DogSortOptions>("breed");

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
          onSelectionChange={(_key) => {
            const key = _key as { currentKey: DogSortOptions };
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
          onSelectionChange={(key) =>
            updateSort(`${sortField}:${key as "asc" | "desc"}`)
          }
        >
          <Tab key="asc" title="Ascending"></Tab>
          <Tab key="desc" title="Descending"></Tab>
        </Tabs>
      </div>
    </div>
  );
};
