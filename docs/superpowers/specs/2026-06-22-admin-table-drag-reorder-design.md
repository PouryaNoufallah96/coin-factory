# Drag-and-drop reordering for admin tables

## Problem

The Questions and Categories admin tables (`questions-admin-manager.tsx`,
`categories-admin-manager.tsx`) currently reorder rows via ArrowUp/ArrowDown
buttons that swap a row with its immediate neighbor (`moveOrderedId`). Reordering
across more than one position requires many clicks. We want drag-and-drop
reordering instead.

## Scope

Both admin tables, since they share `AdminEntityTable` / `DataTable` and have
identical reorder plumbing (`orderedIds` prop, `reorder` row action,
`useOptimistic` row state).

## Approach

Use `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (new
dependencies). Replace the ArrowUp/ArrowDown buttons with a drag handle column.
Keyboard accessibility comes from dnd-kit's `KeyboardSensor`
(`sortableKeyboardCoordinates`), not from dedicated buttons.

### 1. `reorderIds` helper

`src/features/admin/lib/move-ordered-id.ts` gains a second exported function
alongside the existing `moveOrderedId`:

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

This generalizes the adjacent-swap-only `moveOrderedId` to an arbitrary-distance
move, operating on the full cross-page `orderedIds` list (not just the rows
visible on the current page).

`moveOrderedId` itself is removed along with the arrow buttons that used it,
since nothing else calls it.

### 2. `DataTable` changes

`src/components/data-table/data-table.tsx` gains two optional props:

- `enableRowDrag?: boolean`
- `onReorderRow?: (activeId: string, overId: string) => void`

When both are present:

- Wrap `TableBody` in dnd-kit's `DndContext` (sensors: `PointerSensor`,
  `KeyboardSensor` with `sortableKeyboardCoordinates`) and `SortableContext`
  (`items` = current page row ids, `strategy: verticalListSortingStrategy`).
- Prepend a structural drag-handle column: one empty `TableHead` in the header
  row, and one `TableCell` per body row containing a `GripVertical` icon button
  with `useSortable(row.id)`'s `attributes`/`listeners` and `aria-label="Reorder row"`.
  This column is not part of the `ColumnDef[]` passed in by callers — it's
  rendered directly by `DataTable`, so neither manager touches its columns array.
- Each body `<TableRow>` becomes a small `SortableTableRow` subcomponent that
  calls `useSortable({ id: row.id })`, applies the `transform`/`transition`
  style via `CSS.Transform.toString`, and sets `data-dragging` while active for
  a visual lift (opacity/shadow).
- On `DragEndEvent`, if `over` exists and `active.id !== over.id`, call
  `onReorderRow(String(active.id), String(over.id))`.

When `enableRowDrag` is false/unset, rendering is unchanged from today (no
dnd-kit wrapper, no handle column) — existing non-reorderable tables are
unaffected.

### 3. `AdminEntityTable` changes

Passes `enableRowDrag` and `onReorderRow` straight through to `DataTable` as
new optional props on `AdminEntityTableProps`.

### 4. Manager changes (`questions-admin-manager.tsx`, `categories-admin-manager.tsx`)

- Remove `ArrowUp`/`ArrowDown` imports, the two arrow `AdminRowActionButton`s
  per row, and `moveQuestion`/`moveCategory`.
- Remove the `index` lookup (`orderedIds.indexOf(...)`) used only for arrow
  disabling — no longer needed.
- Add a handler using the new helper:

  ```ts
  async function reorderQuestionRow(activeId: string, overId: string) {
    const ids = reorderIds(orderedIds, activeId, overId);
    if (!ids) return;
    await runOptimisticAction({ ids, type: "reorder" });
  }
  ```

- Pass to `AdminEntityTable`:
  - `enableRowDrag={canReorder && !isRowActionPending}`
  - `onReorderRow={reorderQuestionRow}`

  Reusing the existing `canReorder` gate (already disables arrows when
  `showDeleted`/`search` is active or sort isn't `sortOrder asc`) keeps drag
  disabled in those same ambiguous states.

## Edge cases

- **Filtered/searched/sorted view:** `canReorder` is `false`, so
  `enableRowDrag` is `false` and the handle column doesn't render at all —
  matches today's behavior of hiding/disabling arrows.
- **Pagination:** drag is only possible between rows visible on the current
  page (dnd-kit only sees rendered DOM nodes), but `reorderIds` operates on the
  full `orderedIds` array using each id's true position, so a same-page drag
  still produces a correct global reorder.
- **Pending state:** while a previous reorder/action request is in flight,
  `enableRowDrag` is `false`, preventing overlapping optimistic updates.
- **Action failure:** unchanged — `runOptimisticAction` already surfaces
  `result.errorMessage` via `AdminActionErrorBanner` and skips the optimistic
  update on error.

## Out of scope

- Any other `DataTable` consumers besides the two admin managers (drag stays
  opt-in via `enableRowDrag`, off by default).
- Cross-page drag-and-drop.
- Touch-specific gesture tuning beyond dnd-kit's defaults.
