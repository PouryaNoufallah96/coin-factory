# Admin Table Drag-and-Drop Reordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ArrowUp/ArrowDown row-reorder buttons on the Questions and Categories admin tables with drag-and-drop reordering.

**Architecture:** Add `@dnd-kit` to the shared `DataTable` component behind two new opt-in props (`enableRowDrag`, `onReorderRow`). `AdminEntityTable` passes them through. Each admin manager wires the existing `reorder` row action to drag events via a new `reorderIds` helper that generalizes the existing adjacent-swap-only `moveOrderedId` to an arbitrary-distance move.

**Tech Stack:** Next.js, React, TypeScript, `@tanstack/react-table`, new deps `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.

## Global Constraints

- No automated test framework exists in this repo (no vitest/jest/playwright configured). Verification is via `pnpm typecheck`, `pnpm lint`, and manual browser checks (`pnpm dev`) — not automated tests.
- Follow existing code style: no semicolons-optional weirdness, alphabetized props per biome, `"use client"` at top of client component files (already present in all files touched).
- Drag must be disabled whenever `canReorder` is false (search active, `showDeleted` true, or sort isn't `sortOrder asc`) — same gate the old arrows used.
- Drag must be disabled while a row action is pending (`isRowActionPending`).

---

### Task 1: Add dnd-kit dependencies

**Files:**
- Modify: `package.json` (via pnpm, not hand-edited)

**Interfaces:**
- Produces: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` importable from any file.

- [ ] **Step 1: Install the packages**

Run: `cd "/Users/samane/Desktop/The One/tokenize/app" && pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

Expected: `package.json` `dependencies` gains all three packages; `pnpm-lock.yaml` updates.

- [ ] **Step 2: Verify install**

Run: `cd "/Users/samane/Desktop/The One/tokenize/app" && node -e "require.resolve('@dnd-kit/core'); require.resolve('@dnd-kit/sortable'); require.resolve('@dnd-kit/utilities'); console.log('ok')"`

Expected: prints `ok`.

- [ ] **Step 3: Commit**

```bash
cd "/Users/samane/Desktop/The One/tokenize/app"
git add package.json pnpm-lock.yaml
git commit -m "Add @dnd-kit dependencies for admin table drag-and-drop reordering"
```

---

### Task 2: Add `reorderIds` helper, remove `moveOrderedId`

**Files:**
- Modify: `src/features/admin/lib/move-ordered-id.ts`
- Modify (later tasks will remove the only callers; this task just changes the helper file): none else yet.

**Interfaces:**
- Consumes: `arrayMove` from `@dnd-kit/sortable` (Task 1).
- Produces: `reorderIds(ids: readonly string[], activeId: string, overId: string): string[] | null` — exported function used by Tasks 5 and 6.

Current file content (for reference, to be replaced):

```ts
export function moveOrderedId(
  ids: readonly string[],
  id: string,
  delta: -1 | 1
) {
  const index = ids.indexOf(id);
  const nextIndex = index + delta;

  if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) {
    return null;
  }

  const next = [...ids];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];

  return next;
}
```

- [ ] **Step 1: Replace the file contents**

Write `src/features/admin/lib/move-ordered-id.ts`:

```ts
import { arrayMove } from "@dnd-kit/sortable";

export function reorderIds(
  ids: readonly string[],
  activeId: string,
  overId: string
) {
  const activeIndex = ids.indexOf(activeId);
  const overIndex = ids.indexOf(overId);

  if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
    return null;
  }

  return arrayMove([...ids], activeIndex, overIndex);
}
```

- [ ] **Step 2: Confirm no other file still imports `moveOrderedId`**

Run: `cd "/Users/samane/Desktop/The One/tokenize/app" && grep -rl "moveOrderedId" src`

Expected: lists `src/features/questions/components/questions-admin-manager.tsx` and `src/features/categories/components/categories-admin-manager.tsx` only (these are fixed in Tasks 5 and 6 — this is expected to show errors until then, do not run typecheck yet).

- [ ] **Step 3: Commit**

```bash
cd "/Users/samane/Desktop/The One/tokenize/app"
git add src/features/admin/lib/move-ordered-id.ts
git commit -m "Replace moveOrderedId with arbitrary-distance reorderIds helper"
```

---

### Task 3: Add drag-and-drop support to `DataTable`

**Files:**
- Modify: `src/components/data-table/data-table.tsx`

**Interfaces:**
- Consumes: `DndContext`, `closestCenter`, `KeyboardSensor`, `PointerSensor`, `useSensor`, `useSensors`, `type DragEndEvent` from `@dnd-kit/core`; `SortableContext`, `sortableKeyboardCoordinates`, `useSortable`, `verticalListSortingStrategy` from `@dnd-kit/sortable`; `CSS` from `@dnd-kit/utilities`. `GripVertical` icon from `lucide-react`. `Button` from `@/components/ui/button`.
- Produces: `DataTableProps` gains `enableRowDrag?: boolean` and `onReorderRow?: (activeId: string, overId: string) => void`. Behavior is unchanged when `enableRowDrag` is falsy or `onReorderRow` is not passed.

Current file (for reference):

```tsx
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
          "overflow-hidden rounded-(--cf-radius-alert) border bg-card transition-opacity",
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
```

- [ ] **Step 1: Write the new file**

Write `src/components/data-table/data-table.tsx`:

```tsx
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
            {rows.length > 0 ? (
              dragEnabled ? (
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
              ) : (
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
              )
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

function SortableTableRow<TData extends RowData>({
  row,
}: {
  row: Row<TData>;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } =
    useSortable({ id: row.id });

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
```

- [ ] **Step 2: Typecheck**

Run: `cd "/Users/samane/Desktop/The One/tokenize/app" && pnpm typecheck`

Expected: no new errors from `data-table.tsx` (errors from `questions-admin-manager.tsx`/`categories-admin-manager.tsx` referencing `moveOrderedId` are still expected at this point — Tasks 5/6 fix those).

- [ ] **Step 3: Lint**

Run: `cd "/Users/samane/Desktop/The One/tokenize/app" && pnpm lint -- src/components/data-table/data-table.tsx`

Expected: no errors (fix any biome formatting complaints by running `pnpm format -- src/components/data-table/data-table.tsx` if it flags import order or similar).

- [ ] **Step 4: Commit**

```bash
cd "/Users/samane/Desktop/The One/tokenize/app"
git add src/components/data-table/data-table.tsx
git commit -m "Add opt-in drag-and-drop row reordering to DataTable"
```

---

### Task 4: Pass drag props through `AdminEntityTable`

**Files:**
- Modify: `src/features/admin/components/admin-entity-table.tsx`

**Interfaces:**
- Consumes: `DataTable`'s new `enableRowDrag`/`onReorderRow` props (Task 3).
- Produces: `AdminEntityTableProps` gains `enableRowDrag?: boolean` and `onReorderRow?: (activeId: string, overId: string) => void`, consumed by Tasks 5 and 6.

- [ ] **Step 1: Add the two props to the interface**

In `src/features/admin/components/admin-entity-table.tsx`, change:

```ts
interface AdminEntityTableProps<TData extends RowData & { id: string }> {
  columns: ColumnDef<TData>[];
  createControl: ReactNode;
  deletedLabel: string;
  description: string;
  emptyMessage?: string;
  eyebrow: string;
  pending?: boolean;
  rows: TData[];
  searchPlaceholder: string;
  title: string;
  totalRows: number;
}
```

to:

```ts
interface AdminEntityTableProps<TData extends RowData & { id: string }> {
  columns: ColumnDef<TData>[];
  createControl: ReactNode;
  deletedLabel: string;
  description: string;
  emptyMessage?: string;
  enableRowDrag?: boolean;
  eyebrow: string;
  onReorderRow?: (activeId: string, overId: string) => void;
  pending?: boolean;
  rows: TData[];
  searchPlaceholder: string;
  title: string;
  totalRows: number;
}
```

- [ ] **Step 2: Destructure and forward the props**

Change the function signature:

```ts
export function AdminEntityTable<TData extends RowData & { id: string }>({
  columns,
  createControl,
  deletedLabel,
  description,
  emptyMessage = "No records found.",
  eyebrow,
  pending = false,
  rows,
  searchPlaceholder,
  title,
  totalRows,
}: AdminEntityTableProps<TData>) {
```

to:

```ts
export function AdminEntityTable<TData extends RowData & { id: string }>({
  columns,
  createControl,
  deletedLabel,
  description,
  emptyMessage = "No records found.",
  enableRowDrag = false,
  eyebrow,
  onReorderRow,
  pending = false,
  rows,
  searchPlaceholder,
  title,
  totalRows,
}: AdminEntityTableProps<TData>) {
```

Then change the `<DataTable>` call:

```tsx
      <DataTable
        emptyMessage={emptyMessage}
        isPending={tablePending}
        table={table}
        toolbar={
```

to:

```tsx
      <DataTable
        emptyMessage={emptyMessage}
        enableRowDrag={enableRowDrag}
        isPending={tablePending}
        onReorderRow={onReorderRow}
        table={table}
        toolbar={
```

- [ ] **Step 3: Typecheck and lint**

Run: `cd "/Users/samane/Desktop/The One/tokenize/app" && pnpm typecheck && pnpm lint -- src/features/admin/components/admin-entity-table.tsx`

Expected: no new errors (same pre-existing `moveOrderedId` errors in the two manager files remain until Tasks 5/6).

- [ ] **Step 4: Commit**

```bash
cd "/Users/samane/Desktop/The One/tokenize/app"
git add src/features/admin/components/admin-entity-table.tsx
git commit -m "Forward drag-and-drop props from AdminEntityTable to DataTable"
```

---

### Task 5: Wire drag-and-drop into Questions admin manager

**Files:**
- Modify: `src/features/questions/components/questions-admin-manager.tsx`

**Interfaces:**
- Consumes: `reorderIds` from `src/features/admin/lib/move-ordered-id.ts` (Task 2); `AdminEntityTable`'s `enableRowDrag`/`onReorderRow` props (Task 4).
- Produces: none consumed elsewhere.

- [ ] **Step 1: Update imports**

Change:

```ts
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
} from "lucide-react";
```

to:

```ts
import { Edit3, Eye, EyeOff, RotateCcw, Trash2 } from "lucide-react";
```

Change:

```ts
import { moveOrderedId } from "@/features/admin/lib/move-ordered-id";
```

to:

```ts
import { reorderIds } from "@/features/admin/lib/move-ordered-id";
```

- [ ] **Step 2: Replace `moveQuestion` with `reorderQuestionRow`**

Change:

```ts
  async function moveQuestion(id: string, delta: -1 | 1) {
    const ids = moveOrderedId(orderedIds, id, delta);
    if (!ids) {
      return;
    }
    await runOptimisticAction({ ids, type: "reorder" });
  }
```

to:

```ts
  async function reorderQuestionRow(activeId: string, overId: string) {
    const ids = reorderIds(orderedIds, activeId, overId);
    if (!ids) {
      return;
    }
    await runOptimisticAction({ ids, type: "reorder" });
  }
```

- [ ] **Step 3: Remove the arrow buttons and the `index` lookup**

Change:

```tsx
      cell: ({ row }) => {
        const question = row.original;
        const index = orderedIds.indexOf(question.id);
        const isDeleted = Boolean(question.deletedAt);

        return (
          <AdminRowActions>
            {isDeleted ? (
              <AdminRowActionButton
                disabled={isRowActionPending}
                label="Restore question"
                onClick={() => restoreQuestionRow(question)}
                variant="outline"
              >
                <RotateCcw aria-hidden="true" />
              </AdminRowActionButton>
            ) : (
              <>
                <AdminRowActionButton
                  disabled={isRowActionPending || !canReorder || index <= 0}
                  label="Move question up"
                  onClick={() => moveQuestion(question.id, -1)}
                  variant="ghost"
                >
                  <ArrowUp aria-hidden="true" />
                </AdminRowActionButton>
                <AdminRowActionButton
                  disabled={
                    isRowActionPending ||
                    !canReorder ||
                    index < 0 ||
                    index >= orderedIds.length - 1
                  }
                  label="Move question down"
                  onClick={() => moveQuestion(question.id, 1)}
                  variant="ghost"
                >
                  <ArrowDown aria-hidden="true" />
                </AdminRowActionButton>
                <AdminRowActionButton
```

to:

```tsx
      cell: ({ row }) => {
        const question = row.original;
        const isDeleted = Boolean(question.deletedAt);

        return (
          <AdminRowActions>
            {isDeleted ? (
              <AdminRowActionButton
                disabled={isRowActionPending}
                label="Restore question"
                onClick={() => restoreQuestionRow(question)}
                variant="outline"
              >
                <RotateCcw aria-hidden="true" />
              </AdminRowActionButton>
            ) : (
              <>
                <AdminRowActionButton
```

(The rest of the `<>...</>` block — Edit/active-toggle/Delete buttons — is unchanged.)

- [ ] **Step 4: Wire the new props on `<AdminEntityTable>`**

Change:

```tsx
      <AdminEntityTable
        columns={columns}
        createControl={
          <AdminCreateButton onClick={() => setModal({ mode: "create" })}>
            New question
          </AdminCreateButton>
        }
        deletedLabel="Archived"
        description="Manage the ordered questions used by the onboarding wizard."
        emptyMessage="No questions found."
        eyebrow="Admin"
        pending={isRowActionPending}
        rows={optimisticRows}
        searchPlaceholder="Search questions"
        title="Questions"
        totalRows={totalRows}
      />
```

to:

```tsx
      <AdminEntityTable
        columns={columns}
        createControl={
          <AdminCreateButton onClick={() => setModal({ mode: "create" })}>
            New question
          </AdminCreateButton>
        }
        deletedLabel="Archived"
        description="Manage the ordered questions used by the onboarding wizard."
        emptyMessage="No questions found."
        enableRowDrag={canReorder && !isRowActionPending}
        eyebrow="Admin"
        onReorderRow={reorderQuestionRow}
        pending={isRowActionPending}
        rows={optimisticRows}
        searchPlaceholder="Search questions"
        title="Questions"
        totalRows={totalRows}
      />
```

- [ ] **Step 5: Typecheck and lint**

Run: `cd "/Users/samane/Desktop/The One/tokenize/app" && pnpm typecheck && pnpm lint -- src/features/questions/components/questions-admin-manager.tsx`

Expected: no errors.

- [ ] **Step 6: Manual verification**

Run: `cd "/Users/samane/Desktop/The One/tokenize/app" && pnpm dev`

In a browser, go to the Questions admin page (ensure no search filter and `showDeleted` off, sorted by Order ascending — the default). Confirm:
- A grip handle column appears, arrow buttons are gone.
- Dragging a row to a new position reorders the list and persists after a page refresh.
- Turning on "Archived" or typing into search hides the grip handle (drag disabled).
- Tab to a grip handle and press Space, then arrow keys, then Space again — row reorders via keyboard.

- [ ] **Step 7: Commit**

```bash
cd "/Users/samane/Desktop/The One/tokenize/app"
git add src/features/questions/components/questions-admin-manager.tsx
git commit -m "Replace question reorder arrows with drag-and-drop"
```

---

### Task 6: Wire drag-and-drop into Categories admin manager

**Files:**
- Modify: `src/features/categories/components/categories-admin-manager.tsx`

**Interfaces:**
- Consumes: same as Task 5, applied to the categories manager (`reorderIds`, `AdminEntityTable`'s `enableRowDrag`/`onReorderRow`).
- Produces: none consumed elsewhere.

This mirrors Task 5 exactly, applied to the categories file.

- [ ] **Step 1: Update imports**

Change:

```ts
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
} from "lucide-react";
```

to:

```ts
import { Edit3, Eye, EyeOff, RotateCcw, Trash2 } from "lucide-react";
```

Change:

```ts
import { moveOrderedId } from "@/features/admin/lib/move-ordered-id";
```

to:

```ts
import { reorderIds } from "@/features/admin/lib/move-ordered-id";
```

- [ ] **Step 2: Replace `moveCategory` with `reorderCategoryRow`**

Change:

```ts
  async function moveCategory(id: string, delta: -1 | 1) {
    const ids = moveOrderedId(orderedIds, id, delta);
    if (!ids) {
      return;
    }
    await runOptimisticAction({ ids, type: "reorder" });
  }
```

to:

```ts
  async function reorderCategoryRow(activeId: string, overId: string) {
    const ids = reorderIds(orderedIds, activeId, overId);
    if (!ids) {
      return;
    }
    await runOptimisticAction({ ids, type: "reorder" });
  }
```

- [ ] **Step 3: Remove the arrow buttons and the `index` lookup**

Change:

```tsx
      cell: ({ row }) => {
        const category = row.original;
        const index = orderedIds.indexOf(category.id);
        const isDeleted = Boolean(category.deletedAt);

        return (
          <AdminRowActions>
            {isDeleted ? (
              <AdminRowActionButton
                disabled={isRowActionPending}
                label="Restore category"
                onClick={() => restoreCategoryRow(category)}
                variant="outline"
              >
                <RotateCcw aria-hidden="true" />
              </AdminRowActionButton>
            ) : (
              <>
                <AdminRowActionButton
                  disabled={isRowActionPending || !canReorder || index <= 0}
                  label="Move category up"
                  onClick={() => moveCategory(category.id, -1)}
                  variant="ghost"
                >
                  <ArrowUp aria-hidden="true" />
                </AdminRowActionButton>
                <AdminRowActionButton
                  disabled={
                    isRowActionPending ||
                    !canReorder ||
                    index < 0 ||
                    index >= orderedIds.length - 1
                  }
                  label="Move category down"
                  onClick={() => moveCategory(category.id, 1)}
                  variant="ghost"
                >
                  <ArrowDown aria-hidden="true" />
                </AdminRowActionButton>
                <AdminRowActionButton
```

to:

```tsx
      cell: ({ row }) => {
        const category = row.original;
        const isDeleted = Boolean(category.deletedAt);

        return (
          <AdminRowActions>
            {isDeleted ? (
              <AdminRowActionButton
                disabled={isRowActionPending}
                label="Restore category"
                onClick={() => restoreCategoryRow(category)}
                variant="outline"
              >
                <RotateCcw aria-hidden="true" />
              </AdminRowActionButton>
            ) : (
              <>
                <AdminRowActionButton
```

(The rest of the block — Edit/active-toggle/Delete buttons — is unchanged.)

- [ ] **Step 4: Wire the new props on `<AdminEntityTable>`**

Change:

```tsx
      <AdminEntityTable
        columns={columns}
        createControl={
          <AdminCreateButton onClick={() => setModal({ mode: "create" })}>
            New category
          </AdminCreateButton>
        }
        deletedLabel="Deleted"
        description="Manage the business categories used by the landing funnel."
        emptyMessage="No categories found."
        eyebrow="Admin"
        pending={isRowActionPending}
        rows={optimisticRows}
        searchPlaceholder="Search categories"
        title="Categories"
        totalRows={totalRows}
      />
```

to:

```tsx
      <AdminEntityTable
        columns={columns}
        createControl={
          <AdminCreateButton onClick={() => setModal({ mode: "create" })}>
            New category
          </AdminCreateButton>
        }
        deletedLabel="Deleted"
        description="Manage the business categories used by the landing funnel."
        emptyMessage="No categories found."
        enableRowDrag={canReorder && !isRowActionPending}
        eyebrow="Admin"
        onReorderRow={reorderCategoryRow}
        pending={isRowActionPending}
        rows={optimisticRows}
        searchPlaceholder="Search categories"
        title="Categories"
        totalRows={totalRows}
      />
```

- [ ] **Step 5: Typecheck and lint**

Run: `cd "/Users/samane/Desktop/The One/tokenize/app" && pnpm typecheck && pnpm lint -- src/features/categories/components/categories-admin-manager.tsx`

Expected: no errors, and no remaining references to `moveOrderedId` anywhere (`grep -rl "moveOrderedId" src` returns nothing).

- [ ] **Step 6: Manual verification**

With `pnpm dev` still running, repeat the same checks from Task 5 Step 6 on the Categories admin page.

- [ ] **Step 7: Commit**

```bash
cd "/Users/samane/Desktop/The One/tokenize/app"
git add src/features/categories/components/categories-admin-manager.tsx
git commit -m "Replace category reorder arrows with drag-and-drop"
```

---

### Task 7: Full validation pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Run the full validation script**

Run: `cd "/Users/samane/Desktop/The One/tokenize/app" && pnpm format && pnpm typecheck && pnpm lint`

Expected: all pass with no errors. (Skip `pnpm build`/`pnpm react-doctor` here unless you want the full `pnpm validate` — those are slow; running `format`+`typecheck`+`lint` is sufficient to confirm this change is sound.)

- [ ] **Step 2: Confirm `moveOrderedId` is fully gone**

Run: `cd "/Users/samane/Desktop/The One/tokenize/app" && grep -rn "moveOrderedId" src`

Expected: no output.

- [ ] **Step 3: Final manual smoke test**

With `pnpm dev` running, re-verify both Questions and Categories admin pages: drag reorder works, persists on refresh, is disabled while searching/showing archived/deleted items, and keyboard reordering (Space, arrows, Space) works on both.
