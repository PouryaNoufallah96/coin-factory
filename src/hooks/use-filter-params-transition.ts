/// <reference types="react/canary" />
"use client";

import { type Options, throttle, useQueryStates } from "nuqs";
import {
  addTransitionType,
  type TransitionStartFunction,
  useTransition,
} from "react";
import { FILTER_TRANSITION_TYPE } from "@/hooks/filter-transition-types";
import {
  DEFAULT_PAGE,
  FILTER_URL_UPDATE_THROTTLE_MS,
  filterParams,
} from "@/lib/filter-params";

const queryStateOptions: Options = {
  history: "replace",
  limitUrlUpdates: throttle(FILTER_URL_UPDATE_THROTTLE_MS),
  scroll: false,
  shallow: false, // notify the server so RSC lists refetch
};

/**
 * nuqs filter state bound to a typed transition. Each update helper issues a
 * single setFilters call: one URL update, one RSC refetch — not one per key.
 */
export function useFilterParamsTransition() {
  const [isPending, startTransition] = useTransition();

  const startFilterTransition: TransitionStartFunction = (callback) => {
    startTransition(() => {
      // Ships in Next's vendored React canary; typed via react/canary above.
      addTransitionType(FILTER_TRANSITION_TYPE);
      callback();
    });
  };

  const [filters, setFilters] = useQueryStates(filterParams, {
    ...queryStateOptions,
    startTransition: startFilterTransition,
  });

  const updateSearch = (search: string) =>
    setFilters({ search, page: DEFAULT_PAGE });

  const updatePage = (page: number) => setFilters({ page });

  const updatePageSize = (pageSize: number) =>
    setFilters({ pageSize, page: DEFAULT_PAGE });

  const updateSort = (orderBy: string, orderByDesc = false) =>
    setFilters({ orderBy, orderByDesc, page: DEFAULT_PAGE });

  const updateListFilters = (
    values: Partial<
      Pick<
        typeof filters,
        "orderBy" | "orderByDesc" | "pageSize" | "search" | "showDeleted"
      >
    >
  ) => setFilters({ ...values, page: DEFAULT_PAGE });

  const clearSort = () =>
    setFilters({ orderBy: "", orderByDesc: false, page: DEFAULT_PAGE });

  const resetFilters = () => setFilters(null);

  return {
    clearSort,
    filters,
    isPending,
    resetFilters,
    setFilters,
    updateListFilters,
    updatePage,
    updatePageSize,
    updateSearch,
    updateSort,
  };
}
