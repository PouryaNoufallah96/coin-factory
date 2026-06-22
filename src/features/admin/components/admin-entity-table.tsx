"use client";

import type { ColumnDef, RowData } from "@tanstack/react-table";
import { ArchiveRestore, Plus } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/components/data-table/use-data-table";
import { Button } from "@/components/ui/button";
import { hasActiveFilterParams } from "@/lib/filter-params";

interface AdminEntityTableProps<TData extends RowData & { id: string }> {
  columns: ColumnDef<TData>[];
  createControl: ReactNode;
  deletedLabel: string;
  description: string;
  emptyMessage?: string;
  enableRowDrag?: boolean;
  onReorderRow?: (activeId: string, overId: string) => void;
  pending?: boolean;
  rows: TData[];
  searchPlaceholder: string;
  title: string;
  totalRows: number;
}

export function AdminEntityTable<TData extends RowData & { id: string }>({
  columns,
  createControl,
  deletedLabel,
  description,
  emptyMessage = "No records found.",
  enableRowDrag = false,
  onReorderRow,
  pending = false,
  rows,
  searchPlaceholder,
  title,
  totalRows,
}: AdminEntityTableProps<TData>) {
  const {
    filters,
    isPending,
    resetFilters,
    table,
    updateListFilters,
    updateSearch,
  } = useDataTable({
    columns,
    data: rows,
    getRowId: (row) => row.id,
    totalRows,
  });
  const showDeleted = filters.showDeleted;
  const tablePending = isPending || pending;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="font-semibold text-2xl text-cf-text-primary tracking-normal sm:text-3xl">
            {title}
          </h1>
          <p className="max-w-2xl text-cf-text-muted text-sm leading-6">
            {description}
          </p>
        </div>
        <div className="shrink-0">{createControl}</div>
      </section>

      <DataTable
        emptyMessage={emptyMessage}
        enableRowDrag={enableRowDrag}
        isPending={tablePending}
        onReorderRow={onReorderRow}
        table={table}
        toolbar={
          <DataTableToolbar
            canReset={hasActiveFilterParams(filters)}
            isPending={tablePending}
            onReset={resetFilters}
            onSearchChange={updateSearch}
            search={filters.search}
            searchPlaceholder={searchPlaceholder}
          >
            <Button
              aria-pressed={showDeleted}
              onClick={() => updateListFilters({ showDeleted: !showDeleted })}
              size="sm"
              type="button"
              variant={showDeleted ? "secondary" : "outline"}
            >
              <ArchiveRestore data-icon="inline-start" />
              {deletedLabel}
            </Button>
          </DataTableToolbar>
        }
      />
    </div>
  );
}

export function AdminCreateButton({
  children,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button size="sm" type="button" {...props}>
      <Plus data-icon="inline-start" />
      {children}
    </Button>
  );
}
