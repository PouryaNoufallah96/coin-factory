"use client";

import type { TableOptions } from "@tanstack/react-table";
import {
  functionalUpdate,
  getCoreRowModel,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { useFilterParamsTransition } from "@/hooks/use-filter-params-transition";
import {
  getPageCount,
  toListPaginationState,
  toListSortingState,
} from "@/lib/filter-params";

type ManagedTableOptions<TData extends RowData> = Omit<
  TableOptions<TData>,
  | "getCoreRowModel"
  | "manualFiltering"
  | "manualPagination"
  | "manualSorting"
  | "onColumnVisibilityChange"
  | "onPaginationChange"
  | "onRowSelectionChange"
  | "onSortingChange"
  | "pageCount"
  | "state"
>;

interface UseDataTableOptions<TData extends RowData>
  extends ManagedTableOptions<TData> {
  initialColumnVisibility?: VisibilityState;
  initialRowSelection?: RowSelectionState;
  totalRows: number;
}

// TanStack Table v8 returns a mutable instance the React Compiler must not
// memoize (compiler knownIncompatible; facebook/react#33057). Sanctioned
// opt-out, not hand-memoization — remove when the kit moves to Table v9.
export function useDataTable<TData extends RowData>({
  initialColumnVisibility,
  initialRowSelection,
  totalRows,
  ...tableOptions
}: UseDataTableOptions<TData>) {
  "use no memo";
  const {
    clearSort,
    filters,
    isPending,
    resetFilters,
    updateListFilters,
    updatePage,
    updatePageSize,
    updateSearch,
    updateSort,
  } = useFilterParamsTransition();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initialRowSelection ?? {}
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {}
  );

  const pagination = toListPaginationState(filters);
  const sorting = toListSortingState(filters);
  const pageCount = getPageCount(totalRows, pagination.pageSize);

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const nextPagination = functionalUpdate(updater, pagination);

    if (nextPagination.pageSize !== pagination.pageSize) {
      updatePageSize(nextPagination.pageSize);
      return;
    }

    updatePage(nextPagination.pageIndex + 1);
  };

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const [nextSort] = functionalUpdate(updater, sorting);

    if (!nextSort) {
      clearSort();
      return;
    }

    updateSort(nextSort.id, nextSort.desc);
  };

  const table = useReactTable({
    ...tableOptions,
    pageCount,
    state: {
      columnVisibility,
      pagination,
      rowSelection,
      sorting,
    },
    enableRowSelection: true,
    enableMultiSort: false,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
  });

  return {
    clearSort,
    filters,
    isPending,
    resetFilters,
    table,
    updateListFilters,
    updateSearch,
  };
}
