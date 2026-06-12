"use client";

import type { RowData, Table } from "@tanstack/react-table";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PAGE_SIZE_OPTIONS } from "@/lib/filter-params";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData extends RowData> {
  className?: string;
  pageSizeOptions?: readonly number[];
  table: Table<TData>;
}

export function DataTablePagination<TData extends RowData>({
  className,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  table,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = Math.max(table.getPageCount(), 1);
  const selectedPageSize = pageSizeOptions.includes(pageSize)
    ? pageSize
    : pageSizeOptions[0];

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <label className="whitespace-nowrap" htmlFor="data-table-page-size">
          Rows per page
        </label>
        <div className="relative">
          <select
            className="h-8 appearance-none rounded-(--cf-radius-pill) border border-border bg-background pr-8 pl-3 font-medium text-foreground text-sm outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            id="data-table-page-size"
            onChange={(event) => table.setPageSize(Number(event.target.value))}
            value={selectedPageSize}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="min-w-24 text-center">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <Button
          aria-label="Go to previous page"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronLeft />
        </Button>
        <Button
          aria-label="Go to next page"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
