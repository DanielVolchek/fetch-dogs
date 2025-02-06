import { Pagination, Select, SelectItem } from "@heroui/react";
import { FC } from "react";

import { DEFAULT_FORM_STATE } from "./SearchForm";

type PaginationComponentProps = {
  page: number;
  onPaginationMove: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (newItemsPerPage: number) => void;
  total: number;
};

export const PaginationComponent: FC<PaginationComponentProps> = (props) => {
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
