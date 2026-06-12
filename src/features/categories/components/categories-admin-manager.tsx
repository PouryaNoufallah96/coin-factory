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
import { AdminActionErrorBanner } from "@/features/admin/components/admin-action-error-banner";
import {
  AdminCreateButton,
  AdminEntityTable,
} from "@/features/admin/components/admin-entity-table";
import {
  AdminRowActionButton,
  AdminRowActions,
} from "@/features/admin/components/admin-row-action-button";
import { EntityStatusBadge } from "@/features/admin/components/entity-status-badge";
import { formatAdminDate } from "@/features/admin/lib/format-admin-date";
import { moveOrderedId } from "@/features/admin/lib/move-ordered-id";
import type { AdminRowActionInput } from "@/features/admin/schemas/admin-row-action";
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

type CategoryOptimisticAction = AdminRowActionInput;

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

  async function runOptimisticAction(action: CategoryOptimisticAction) {
    setActionError(null);
    const result = await rowAction.execute(action);
    if (result.status === "error") {
      setActionError(result.errorMessage ?? "Action failed.");
      return;
    }
    applyOptimistic(action);
  }

  async function moveCategory(id: string, delta: -1 | 1) {
    const ids = moveOrderedId(orderedIds, id, delta);
    if (!ids) {
      return;
    }
    await runOptimisticAction({ ids, type: "reorder" });
  }

  async function deleteCategory(category: AdminCategory) {
    if (!(await confirmDelete())) {
      return;
    }
    await runOptimisticAction({ id: category.id, type: "softDelete" });
  }

  async function restoreCategoryRow(category: AdminCategory) {
    await runOptimisticAction({ id: category.id, type: "restore" });
  }

  async function setCategoryActiveRow(category: AdminCategory) {
    const active = !category.active;
    await runOptimisticAction({
      active,
      id: category.id,
      type: "setActive",
    });
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
      cell: ({ row }) => (
        <EntityStatusBadge
          active={row.original.active}
          deletedAt={row.original.deletedAt}
        />
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
    },
    {
      accessorKey: "updatedAt",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-cf-text-muted text-sm">
          {formatAdminDate(row.original.updatedAt)}
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
      {actionError ? <AdminActionErrorBanner message={actionError} /> : null}
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
