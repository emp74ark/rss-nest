export type Pagination = {
  pageNumber: number;
  perPage: number;
};

export type Paginated<T> = {
  total: number;
  result: T[];
};
