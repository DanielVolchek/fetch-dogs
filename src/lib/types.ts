export type Maybe<T> = T | undefined;
export type SortDir = "asc" | "desc";
export type SortFilter<T extends string> = `${T}:${SortDir}`;
