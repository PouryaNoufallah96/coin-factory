"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Archive, Edit3, Eye, EyeOff, RotateCcw } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { ResponsiveModal } from "@/components/common/responsive-modal";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
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
import { reorderIds } from "@/features/admin/lib/move-ordered-id";
import type { AdminRowActionInput } from "@/features/admin/schemas/admin-row-action";
import { runQuestionRowAction } from "@/features/questions/actions/admin-question-actions";
import { QuestionForm } from "@/features/questions/components/question-form";
import type {
  AdminQuestion,
  AdminQuestionListInput,
} from "@/features/questions/schemas/question";
import { useAction } from "@/hooks/use-action";
import { useConfirm } from "@/hooks/use-confirm";

interface QuestionsAdminManagerProps {
  filters: Pick<
    AdminQuestionListInput,
    "orderBy" | "orderDirection" | "search" | "showDeleted"
  >;
  orderedIds: string[];
  rows: AdminQuestion[];
  totalRows: number;
}

type QuestionModal =
  | { mode: "create" }
  | { mode: "edit"; question: AdminQuestion }
  | null;

type QuestionOptimisticAction = AdminRowActionInput;

export function QuestionsAdminManager({
  filters,
  orderedIds,
  rows,
  totalRows,
}: QuestionsAdminManagerProps) {
  const [modal, setModal] = useState<QuestionModal>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isOptimisticPending, startOptimisticTransition] = useTransition();
  const [optimisticRows, applyOptimisticRows] = useOptimistic(
    rows,
    updateOptimisticQuestions
  );
  const rowAction = useAction(runQuestionRowAction);
  const [deleteDialog, confirmDelete] = useConfirm({
    confirmLabel: "Archive question",
    message:
      "The question is removed from the onboarding wizard and can be restored later.",
    title: "Archive question",
    variant: "destructive",
  });
  const canReorder =
    !(filters.showDeleted || filters.search) &&
    filters.orderBy === "sortOrder" &&
    filters.orderDirection === "asc";
  const isRowActionPending = rowAction.isPending || isOptimisticPending;

  function applyOptimistic(action: QuestionOptimisticAction) {
    startOptimisticTransition(() => {
      applyOptimisticRows(action);
    });
  }

  async function runOptimisticAction(action: QuestionOptimisticAction) {
    setActionError(null);
    const result = await rowAction.execute(action);
    if (result.status === "error") {
      setActionError(result.errorMessage ?? "Action failed.");
      return;
    }
    applyOptimistic(action);
  }

  async function reorderQuestionRow(activeId: string, overId: string) {
    const ids = reorderIds(orderedIds, activeId, overId);
    if (!ids) {
      return;
    }
    await runOptimisticAction({ ids, type: "reorder" });
  }

  async function deleteQuestion(question: AdminQuestion) {
    if (!(await confirmDelete())) {
      return;
    }
    await runOptimisticAction({ id: question.id, type: "softDelete" });
  }

  async function restoreQuestionRow(question: AdminQuestion) {
    await runOptimisticAction({ id: question.id, type: "restore" });
  }

  async function setQuestionActiveRow(question: AdminQuestion) {
    const active = !question.active;
    await runOptimisticAction({
      active,
      id: question.id,
      type: "setActive",
    });
  }

  const columns: ColumnDef<AdminQuestion>[] = [
    {
      accessorKey: "text",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-lg font-medium text-cf-text-primary">
          {row.original.text}
        </span>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Question" />
      ),
    },
    {
      accessorKey: "kind",
      cell: ({ row }) => (
        <Badge variant="outline">{kindLabel(row.original.kind)}</Badge>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
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
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-cf-text-muted text-sm">
          {formatAdminDate(row.original.updatedAt)}
        </span>
      ),
      enableSorting: false,
      header: "Updated",
      id: "updatedAt",
    },
    {
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
                  disabled={isRowActionPending}
                  label="Edit question"
                  onClick={() => setModal({ mode: "edit", question })}
                  variant="ghost"
                >
                  <Edit3 aria-hidden="true" />
                </AdminRowActionButton>
                <AdminRowActionButton
                  disabled={isRowActionPending}
                  label={
                    question.active
                      ? "Deactivate question"
                      : "Activate question"
                  }
                  onClick={() => setQuestionActiveRow(question)}
                  variant="ghost"
                >
                  {question.active ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </AdminRowActionButton>
                <AdminRowActionButton
                  disabled={isRowActionPending}
                  label="Archive question"
                  onClick={() => deleteQuestion(question)}
                  variant="destructive"
                >
                  <Archive aria-hidden="true" />
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
      <ResponsiveModal
        description="Create and edit onboarding questions."
        onOpenChange={(open) => {
          if (!open) {
            setModal(null);
          }
        }}
        open={modal !== null}
        size="xl"
        title={modal?.mode === "edit" ? "Edit question" : "New question"}
      >
        {modal ? (
          <QuestionForm
            onSuccess={() => setModal(null)}
            question={modal.mode === "edit" ? modal.question : undefined}
          />
        ) : null}
      </ResponsiveModal>
      {deleteDialog}
    </>
  );
}

function kindLabel(kind: AdminQuestion["kind"]) {
  if (kind === "radio") {
    return "Radio";
  }
  if (kind === "url") {
    return "URL";
  }
  return "Contact";
}

function updateOptimisticQuestions(
  state: AdminQuestion[],
  action: QuestionOptimisticAction
) {
  switch (action.type) {
    case "reorder":
      return reorderQuestionRows(state, action.ids);
    case "restore":
    case "softDelete":
      return state.filter((question) => question.id !== action.id);
    case "setActive":
      return state.map((question) =>
        question.id === action.id
          ? { ...question, active: action.active }
          : question
      );
    default:
      return state;
  }
}

function reorderQuestionRows(rows: AdminQuestion[], ids: readonly string[]) {
  const sortOrderById = new Map(
    ids.map((id, index) => [id, index + 1] as const)
  );

  return rows
    .toSorted(
      (left, right) =>
        (sortOrderById.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (sortOrderById.get(right.id) ?? Number.MAX_SAFE_INTEGER)
    )
    .map((question) => {
      const sortOrder = sortOrderById.get(question.id);
      return sortOrder ? { ...question, sortOrder } : question;
    });
}
