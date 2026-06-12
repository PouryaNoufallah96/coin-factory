"use client";

import {
  flexRender,
  type RowData,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData extends RowData> {
  actionBar?: ReactNode;
  className?: string;
  emptyMessage?: string;
  isPending?: boolean;
  table: TanStackTable<TData>;
  toolbar?: ReactNode;
}

export function DataTable<TData extends RowData>({
  actionBar,
  className,
  emptyMessage = "No results.",
  isPending,
  table,
  toolbar,
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows;

  return (
    <div
      aria-busy={isPending || undefined}
      className={cn("flex w-full flex-col gap-3", className)}
      data-pending={isPending || undefined}
    >
      {toolbar}
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-card transition-opacity",
          isPending &&
            "pointer-events-none animate-pulse opacity-60 motion-reduce:animate-none"
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead colSpan={header.colSpan} key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={table.getAllLeafColumns().length}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-3">
        <DataTablePagination table={table} />
        {actionBar && table.getSelectedRowModel().rows.length > 0
          ? actionBar
          : null}
      </div>
    </div>
  );
}
