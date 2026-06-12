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

type QuestionOptimisticAction =
  | { ids: string[]; type: "reorder" }
  | { id: string; type: "restore" }
  | { active: boolean; id: string; type: "setActive" }
  | { id: string; type: "softDelete" };

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

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
    confirmLabel: "Delete question",
    message:
      "The question is removed from the onboarding wizard and can be restored later.",
    title: "Delete question",
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

  async function recordAction(
    resultPromise: Promise<{ errorMessage?: string; status: string }>
  ) {
    setActionError(null);
    const result = await resultPromise;
    if (result.status === "error") {
      setActionError(result.errorMessage ?? "Action failed.");
    }
  }

  async function moveQuestion(id: string, delta: -1 | 1) {
    const ids = moveId(orderedIds, id, delta);
    if (!ids) {
      return;
    }
    applyOptimistic({ ids, type: "reorder" });
    await recordAction(rowAction.execute({ ids, type: "reorder" }));
  }

  async function deleteQuestion(question: AdminQuestion) {
    if (!(await confirmDelete())) {
      return;
    }
    applyOptimistic({ id: question.id, type: "softDelete" });
    await recordAction(
      rowAction.execute({ id: question.id, type: "softDelete" })
    );
  }

  async function restoreQuestionRow(question: AdminQuestion) {
    applyOptimistic({ id: question.id, type: "restore" });
    await recordAction(rowAction.execute({ id: question.id, type: "restore" }));
  }

  async function setQuestionActiveRow(question: AdminQuestion) {
    const active = !question.active;
    applyOptimistic({ active, id: question.id, type: "setActive" });
    await recordAction(
      rowAction.execute({
        active,
        id: question.id,
        type: "setActive",
      })
    );
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
      cell: ({ row }) => <QuestionStatus question={row.original} />,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
    },
    {
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-cf-text-muted text-sm">
          {formatDate(row.original.updatedAt)}
        </span>
      ),
      enableSorting: false,
      header: "Updated",
      id: "updatedAt",
    },
    {
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
                  label="Delete question"
                  onClick={() => deleteQuestion(question)}
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
            New question
          </AdminCreateButton>
        }
        deletedLabel="Deleted"
        description="Manage the ordered questions used by the onboarding wizard."
        emptyMessage="No questions found."
        eyebrow="Admin"
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

function QuestionStatus({ question }: { question: AdminQuestion }) {
  if (question.deletedAt) {
    return <Badge variant="outline">Deleted</Badge>;
  }

  return (
    <Badge variant={question.active ? "secondary" : "outline"}>
      {question.active ? "Active" : "Inactive"}
    </Badge>
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

function formatDate(value: Date | string) {
  return dateFormatter.format(new Date(value));
}
