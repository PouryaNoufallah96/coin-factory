"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { ResponsiveModal } from "@/components/common/responsive-modal";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import {
  AdminCreateButton,
  AdminEntityTable,
} from "@/features/admin/components/admin-entity-table";
import {
  AdminRowActionButton,
  AdminRowActions,
} from "@/features/admin/components/admin-row-action-button";
import { runCategoryRowAction } from "@/features/categories/actions/admin-category-actions";
import { CategoryForm } from "@/features/categories/components/category-form";
import type {
  AdminCategory,
  AdminCategoryListInput,
} from "@/features/categories/schemas/category";
import { useAction } from "@/hooks/use-action";
import { useConfirm } from "@/hooks/use-confirm";

interface CategoriesAdminManagerProps {
  filters: Pick<
    AdminCategoryListInput,
    "orderBy" | "orderDirection" | "search" | "showDeleted"
  >;
  orderedIds: string[];
  rows: AdminCategory[];
  totalRows: number;
}

type CategoryModal =
  | { category: AdminCategory; mode: "edit" }
  | { mode: "create" }
  | null;

type CategoryOptimisticAction =
  | { ids: string[]; type: "reorder" }
  | { id: string; type: "restore" }
  | { active: boolean; id: string; type: "setActive" }
  | { id: string; type: "softDelete" };

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function CategoriesAdminManager({
  filters,
  orderedIds,
  rows,
  totalRows,
}: CategoriesAdminManagerProps) {
  const [modal, setModal] = useState<CategoryModal>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isOptimisticPending, startOptimisticTransition] = useTransition();
  const [optimisticRows, applyOptimisticRows] = useOptimistic(
    rows,
    updateOptimisticCategories
  );
  const rowAction = useAction(runCategoryRowAction);
  const [deleteDialog, confirmDelete] = useConfirm({
    confirmLabel: "Delete category",
    message:
      "The category is removed from the landing funnel and can be restored later.",
    title: "Delete category",
    variant: "destructive",
  });
  const canReorder =
    !(filters.showDeleted || filters.search) &&
    filters.orderBy === "sortOrder" &&
    filters.orderDirection === "asc";
  const isRowActionPending = rowAction.isPending || isOptimisticPending;

  function applyOptimistic(action: CategoryOptimisticAction) {
    startOptimisticTransition(() => {
      applyOptimisticRows(action);
    });
  }

  async function recordAction(
    resultPromise: Promise<{ errorMessage?: string; status: string }>
  ) {
    setActionError(null);
    const result = await resultPromise;
    if (result.status === "error") {
      setActionError(result.errorMessage ?? "Action failed.");
    }
  }

  async function moveCategory(id: string, delta: -1 | 1) {
    const ids = moveId(orderedIds, id, delta);
    if (!ids) {
      return;
    }
    applyOptimistic({ ids, type: "reorder" });
    await recordAction(rowAction.execute({ ids, type: "reorder" }));
  }

  async function deleteCategory(category: AdminCategory) {
    if (!(await confirmDelete())) {
      return;
    }
    applyOptimistic({ id: category.id, type: "softDelete" });
    await recordAction(
      rowAction.execute({ id: category.id, type: "softDelete" })
    );
  }

  async function restoreCategoryRow(category: AdminCategory) {
    applyOptimistic({ id: category.id, type: "restore" });
    await recordAction(rowAction.execute({ id: category.id, type: "restore" }));
  }

  async function setCategoryActiveRow(category: AdminCategory) {
    const active = !category.active;
    applyOptimistic({ active, id: category.id, type: "setActive" });
    await recordAction(
      rowAction.execute({
        active,
        id: category.id,
        type: "setActive",
      })
    );
  }

  const columns: ColumnDef<AdminCategory>[] = [
    {
      accessorKey: "label",
      cell: ({ row }) => (
        <span className="font-medium text-cf-text-primary">
          {row.original.label}
        </span>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Label" />
      ),
    },
    {
      accessorKey: "sortOrder",
      cell: ({ row }) => (
        <span className="text-cf-text-muted tabular-nums">
          {row.original.sortOrder}
        </span>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order" />
      ),
    },
    {
      accessorKey: "active",
      cell: ({ row }) => <CategoryStatus category={row.original} />,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
    },
    {
      accessorKey: "updatedAt",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-cf-text-muted text-sm">
          {formatDate(row.original.updatedAt)}
        </span>
      ),
      header: "Updated",
      enableSorting: false,
    },
    {
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
                  disabled={isRowActionPending}
                  label="Edit category"
                  onClick={() => setModal({ category, mode: "edit" })}
                  variant="ghost"
                >
                  <Edit3 aria-hidden="true" />
                </AdminRowActionButton>
                <AdminRowActionButton
                  disabled={isRowActionPending}
                  label={
                    category.active
                      ? "Deactivate category"
                      : "Activate category"
                  }
                  onClick={() => setCategoryActiveRow(category)}
                  variant="ghost"
                >
                  {category.active ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </AdminRowActionButton>
                <AdminRowActionButton
                  disabled={isRowActionPending}
                  label="Delete category"
                  onClick={() => deleteCategory(category)}
                  variant="destructive"
                >
                  <Trash2 aria-hidden="true" />
                </AdminRowActionButton>
              </>
            )}
          </AdminRowActions>
        );
      },
      enableSorting: false,
      header: "",
      id: "actions",
    },
  ];

  return (
    <>
      {actionError ? (
        <div
          className="mx-auto mb-4 max-w-7xl rounded-(--cf-radius-alert) border border-cf-error/40 bg-cf-error/10 px-4 py-3 text-cf-error text-sm"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}
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
      <ResponsiveModal
        description="Create and edit funnel categories."
        onOpenChange={(open) => {
          if (!open) {
            setModal(null);
          }
        }}
        open={modal !== null}
        size="default"
        title={modal?.mode === "edit" ? "Edit category" : "New category"}
      >
        {modal ? (
          <CategoryForm
            category={modal.mode === "edit" ? modal.category : undefined}
            onSuccess={() => setModal(null)}
          />
        ) : null}
      </ResponsiveModal>
      {deleteDialog}
    </>
  );
}

function CategoryStatus({ category }: { category: AdminCategory }) {
  if (category.deletedAt) {
    return <Badge variant="outline">Deleted</Badge>;
  }

  return (
    <Badge variant={category.active ? "secondary" : "outline"}>
      {category.active ? "Active" : "Inactive"}
    </Badge>
  );
}

function moveId(ids: readonly string[], id: string, delta: -1 | 1) {
  const index = ids.indexOf(id);
  const nextIndex = index + delta;

  if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) {
    return null;
  }

  const next = [...ids];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];

  return next;
}

function updateOptimisticCategories(
  state: AdminCategory[],
  action: CategoryOptimisticAction
) {
  switch (action.type) {
    case "reorder":
      return reorderCategoryRows(state, action.ids);
    case "restore":
    case "softDelete":
      return state.filter((category) => category.id !== action.id);
    case "setActive":
      return state.map((category) =>
        category.id === action.id
          ? { ...category, active: action.active }
          : category
      );
    default:
      return state;
  }
}

function reorderCategoryRows(rows: AdminCategory[], ids: readonly string[]) {
  const sortOrderById = new Map(
    ids.map((id, index) => [id, index + 1] as const)
  );

  return rows
    .toSorted(
      (left, right) =>
        (sortOrderById.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (sortOrderById.get(right.id) ?? Number.MAX_SAFE_INTEGER)
    )
    .map((category) => {
      const sortOrder = sortOrderById.get(category.id);
      return sortOrder ? { ...category, sortOrder } : category;
    });
}

function formatDate(value: Date | string) {
  return dateFormatter.format(new Date(value));
}
