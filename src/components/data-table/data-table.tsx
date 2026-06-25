"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  flexRender,
  type Row,
  type RowData,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
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
  enableRowDrag?: boolean;
  isPending?: boolean;
  onReorderRow?: (activeId: string, overId: string) => void;
  onRowClick?: (row: TData) => void;
  table: TanStackTable<TData>;
  toolbar?: ReactNode;
}

export function DataTable<TData extends RowData>({
  actionBar,
  className,
  emptyMessage = "No results.",
  enableRowDrag = false,
  isPending,
  onReorderRow,
  onRowClick,
  table,
  toolbar,
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows;
  const dragEnabled = enableRowDrag && Boolean(onReorderRow);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!(onReorderRow && over) || active.id === over.id) {
      return;
    }
    onReorderRow(String(active.id), String(over.id));
  }

  return (
    <div
      aria-busy={isPending || undefined}
      className={cn("flex w-full flex-col gap-3", className)}
      data-pending={isPending || undefined}
    >
      {toolbar}
      <div
        className={cn(
          "overflow-hidden rounded-(--cf-radius-alert) border bg-card transition-opacity",
          isPending &&
            "pointer-events-none animate-pulse opacity-60 motion-reduce:animate-none"
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {dragEnabled ? <TableHead className="w-8" /> : null}
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
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={
                    table.getAllLeafColumns().length + (dragEnabled ? 1 : 0)
                  }
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : null}
            {rows.length > 0 && dragEnabled ? (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                sensors={sensors}
              >
                <SortableContext
                  items={rows.map((row) => row.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {rows.map((row) => (
                    <SortableTableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              </DndContext>
            ) : null}
            {rows.length > 0 && !dragEnabled
              ? rows.map((row) => (
                  <TableRow
                    className={cn(onRowClick && "cursor-pointer")}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
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
              : null}
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

function SortableTableRow<TData extends RowData>({ row }: { row: Row<TData> }) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: row.id });

  return (
    <TableRow
      className={cn(isDragging && "relative z-10 bg-card shadow-md")}
      data-state={row.getIsSelected() ? "selected" : undefined}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <TableCell className="w-8">
        <Button
          aria-label="Reorder row"
          className="cursor-grab active:cursor-grabbing"
          size="icon-sm"
          type="button"
          variant="ghost"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" />
        </Button>
      </TableCell>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
