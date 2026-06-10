"use client";

import type { RowData, Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap">Rows per page</span>
        <div className="flex items-center gap-1">
          {pageSizeOptions.map((option) => (
            <Button
              aria-pressed={pageSize === option}
              key={option}
              onClick={() => table.setPageSize(option)}
              size="sm"
              type="button"
              variant={pageSize === option ? "secondary" : "ghost"}
            >
              {option}
            </Button>
          ))}
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
