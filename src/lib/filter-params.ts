import {
  createLoader,
  type inferParserType,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
} from "nuqs";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_MAX_PAGE_SIZE = 100;
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export const FILTER_URL_UPDATE_THROTTLE_MS = 340;

/** Shared list-view search params (admin tables, filtered lists). */
export const filterParams = {
  search: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  orderBy: parseAsString.withDefault(""),
  orderByDesc: parseAsBoolean.withDefault(false),
};

/** RSC-side loader: const filters = loadFilterParams(await searchParams). */
export const loadFilterParams = createLoader(filterParams);

export type FilterParams = inferParserType<typeof filterParams>;

export type SortDirection = "asc" | "desc";

export interface ListPaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface ListSortingState {
  desc: boolean;
  id: string;
}

export interface NormalizedFilterParams<TOrderBy extends string = string> {
  limit: number;
  offset: number;
  orderBy: TOrderBy | "";
  orderDirection: SortDirection;
  page: number;
  pageSize: number;
  search: string;
}

interface NormalizeFilterParamsOptions<TOrderBy extends string> {
  allowedOrderBy?: readonly TOrderBy[];
  defaultOrderBy?: TOrderBy;
  maxPageSize?: number;
  pageSizeOptions?: readonly number[];
}

function normalizePositiveInteger(value: number, fallback: number) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function normalizePageSize(
  value: number,
  options: {
    maxPageSize?: number;
    pageSizeOptions?: readonly number[];
  } = {}
) {
  const pageSize = normalizePositiveInteger(value, DEFAULT_PAGE_SIZE);
  const maxPageSize = options.maxPageSize ?? DEFAULT_MAX_PAGE_SIZE;
  const allowed = options.pageSizeOptions;

  if (allowed?.length) {
    return allowed.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE;
  }

  return Math.min(pageSize, maxPageSize);
}

function normalizeOrderBy<TOrderBy extends string>(
  orderBy: string,
  options: Pick<
    NormalizeFilterParamsOptions<TOrderBy>,
    "allowedOrderBy" | "defaultOrderBy"
  > = {}
) {
  if (!orderBy) {
    return options.defaultOrderBy ?? "";
  }

  if (!options.allowedOrderBy?.length) {
    return orderBy as TOrderBy;
  }

  return options.allowedOrderBy.includes(orderBy as TOrderBy)
    ? (orderBy as TOrderBy)
    : (options.defaultOrderBy ?? "");
}

function normalizeFilterParams<TOrderBy extends string = string>(
  params: FilterParams,
  options: NormalizeFilterParamsOptions<TOrderBy> = {}
): NormalizedFilterParams<TOrderBy> {
  const page = normalizePositiveInteger(params.page, DEFAULT_PAGE);
  const pageSize = normalizePageSize(params.pageSize, options);
  const orderBy = normalizeOrderBy(params.orderBy, options);
  const orderDirection = orderBy && params.orderByDesc ? "desc" : "asc";

  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy,
    orderDirection,
    page,
    pageSize,
    search: params.search.trim(),
  };
}

function getPageCount(totalRows: number, pageSize: number): number {
  const total = Math.max(totalRows, 0);
  const normalizedPageSize = normalizePageSize(pageSize);

  return Math.max(Math.ceil(total / normalizedPageSize), 1);
}

function toListPaginationState(
  params: Pick<FilterParams, "page" | "pageSize">
): ListPaginationState {
  return {
    pageIndex: Math.max(params.page - 1, 0),
    pageSize: normalizePageSize(params.pageSize),
  };
}

function toListSortingState(
  params: Pick<FilterParams, "orderBy" | "orderByDesc">
): ListSortingState[] {
  return params.orderBy
    ? [{ id: params.orderBy, desc: params.orderByDesc }]
    : [];
}

function hasActiveFilterParams(params: FilterParams): boolean {
  return Boolean(params.search.trim() || params.orderBy || params.orderByDesc);
}

export {
  getPageCount,
  hasActiveFilterParams,
  normalizeFilterParams,
  normalizePageSize,
  toListPaginationState,
  toListSortingState,
};
