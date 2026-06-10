"use client";

import type { Column, RowData } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData extends RowData, TValue> {
  className?: string;
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData extends RowData, TValue>({
  className,
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("truncate", className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();
  let SortIcon = ChevronsUpDown;

  if (sorted === "asc") {
    SortIcon = ArrowUp;
  }

  if (sorted === "desc") {
    SortIcon = ArrowDown;
  }

  return (
    <Button
      aria-label={`Sort by ${title}`}
      className={cn("-ml-3 h-8 px-3", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
      size="sm"
      type="button"
      variant="ghost"
    >
      <span className="truncate">{title}</span>
      <SortIcon data-icon="inline-end" />
    </Button>
  );
}
