export type FetchType<T> =
  | {
      result: T;
      error: null;
    }
  | {
      result: null;
      error: {
        status: number;
        message: string;
      };
    };

export type SortDir = "asc" | "desc";
export type SortFilter<T extends string> = `${T}:${SortDir}`;
