"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Send } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/components/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AdminActionErrorBanner } from "@/features/admin/components/admin-action-error-banner";
import {
  AdminRowActionButton,
  AdminRowActions,
} from "@/features/admin/components/admin-row-action-button";
import { formatAdminDate } from "@/features/admin/lib/format-admin-date";
import { runInquiryRowAction } from "@/features/inquiries/actions/admin-inquiry-actions";
import { InquiryStatusBadge } from "@/features/inquiries/components/inquiry-status-badge";
import {
  inquiryStatusLabels,
  nextInquiryStatus,
} from "@/features/inquiries/lib/status";
import type {
  AdminInquiry,
  AdminInquiryRowActionInput,
} from "@/features/inquiries/schemas/admin-inquiry";
import { useAction } from "@/hooks/use-action";
import { hasActiveFilterParams } from "@/lib/filter-params";

interface InquiriesAdminManagerProps {
  rows: AdminInquiry[];
  showHeader?: boolean;
  totalRows: number;
}

type InquiryOptimisticAction =
  | AdminInquiryRowActionInput
  | { rows: AdminInquiry[]; type: "reset" };

export function InquiriesAdminManager({
  rows,
  showHeader = true,
  totalRows,
}: InquiriesAdminManagerProps) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isOptimisticPending, startOptimisticTransition] = useTransition();
  const [optimisticRows, applyOptimisticRows] = useOptimistic(
    rows,
    updateOptimisticInquiries
  );
  const rowAction = useAction(runInquiryRowAction);
  const isRowActionPending = rowAction.isPending || isOptimisticPending;

  const columns: ColumnDef<AdminInquiry>[] = [
    {
      accessorKey: "email",
      cell: ({ row }) => (
        <div className="flex min-w-52 flex-col gap-1">
          <span className="font-medium text-cf-text-primary">
            {row.original.email}
          </span>
        </div>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact" />
      ),
    },
    {
      accessorKey: "assetDescription",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-lg whitespace-normal text-cf-text-muted">
          {row.original.assetDescription ?? "-"}
        </span>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
    },
    {
      accessorKey: "status",
      cell: ({ row }) => {
        const inquiry = row.original;
        const nextStatus = nextInquiryStatus(inquiry.status);

        if (!nextStatus) {
          return <InquiryStatusBadge status={inquiry.status} />;
        }

        return (
          <div className="flex items-center gap-1.5">
            <InquiryStatusBadge status={inquiry.status} />
            <ChevronRight
              aria-hidden="true"
              className="size-3 shrink-0 text-cf-text-muted"
            />
            <TooltipProvider delay={300}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      className="whitespace-nowrap rounded-4xl border border-cf-cream/30 border-dashed px-2 py-0.5 font-medium text-cf-cream/50 text-xs transition-colors hover:border-cf-cream hover:bg-cf-cream/10 hover:text-cf-cream disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-cf-cream/30 disabled:hover:bg-transparent"
                      disabled={isRowActionPending}
                      onClick={(event) => {
                        event.stopPropagation();
                        runOptimisticAction({
                          id: inquiry.id,
                          status: nextStatus,
                          type: "setStatus",
                        });
                      }}
                      type="button"
                    >
                      {inquiryStatusLabels[nextStatus]}
                    </button>
                  }
                />
                <TooltipContent>
                  Mark {inquiryStatusLabels[nextStatus].toLowerCase()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
    },
    {
      accessorKey: "notifiedAt",
      cell: ({ row }) => <NotificationBadge inquiry={row.original} />,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-cf-text-muted text-sm">
          {formatAdminDate(row.original.createdAt)}
        </span>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
    },
    {
      cell: ({ row }) => {
        const inquiry = row.original;

        return (
          <AdminRowActions>
            {inquiry.notifiedAt ? null : (
              <AdminRowActionButton
                disabled={isRowActionPending}
                label="Resend email"
                onClick={(event) => {
                  event.stopPropagation();
                  runOptimisticAction({
                    id: inquiry.id,
                    type: "resendNotification",
                  });
                }}
                variant="ghost"
              >
                <Send aria-hidden="true" />
              </AdminRowActionButton>
            )}
          </AdminRowActions>
        );
      },
      enableSorting: false,
      header: "",
      id: "actions",
    },
  ];

  const {
    filters: tableFilters,
    isPending,
    resetFilters,
    table,
    updateSearch,
  } = useDataTable({
    columns,
    data: optimisticRows,
    getRowId: (row) => row.id,
    totalRows,
  });
  const tablePending = isPending || isRowActionPending;

  async function runOptimisticAction(action: AdminInquiryRowActionInput) {
    startOptimisticTransition(() => {
      applyOptimisticRows(action);
    });
    setActionError(null);

    const result = await rowAction.execute(action);
    if (result.status === "error") {
      setActionError(result.errorMessage ?? "Action failed.");
      startOptimisticTransition(() =>
        applyOptimisticRows({ rows, type: "reset" })
      );
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {actionError ? <AdminActionErrorBanner message={actionError} /> : null}
      {showHeader ? (
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="font-semibold text-2xl text-cf-text-primary tracking-normal sm:text-3xl">
              Inquiries
            </h1>
            <p className="max-w-2xl text-cf-text-muted text-sm leading-6">
              Review founder submissions, files, and notification status.
            </p>
          </div>
        </section>
      ) : null}

      <DataTable
        emptyMessage="No inquiries found."
        isPending={tablePending}
        onRowClick={(row) => router.push(`/admin/inquiries/${row.id}` as Route)}
        table={table}
        toolbar={
          <DataTableToolbar
            canReset={hasActiveFilterParams({
              ...tableFilters,
              showDeleted: false,
            })}
            isPending={tablePending}
            onReset={resetFilters}
            onSearchChange={updateSearch}
            search={tableFilters.search}
            searchPlaceholder="Search inquiries"
          />
        }
      />
    </div>
  );
}

function NotificationBadge({ inquiry }: { inquiry: AdminInquiry }) {
  if (inquiry.notifiedAt) {
    return <Badge variant="outline">Sent</Badge>;
  }

  if (inquiry.notificationError) {
    return <Badge variant="secondary">Failed</Badge>;
  }

  return <Badge variant="secondary">Not emailed</Badge>;
}

function updateOptimisticInquiries(
  state: AdminInquiry[],
  action: InquiryOptimisticAction
) {
  if (action.type === "reset") {
    return action.rows;
  }

  if (action.type === "resendNotification") {
    return state.map((inquiry) =>
      inquiry.id === action.id
        ? {
            ...inquiry,
            notificationAttemptedAt: new Date(),
            notificationError: null,
          }
        : inquiry
    );
  }

  return state.map((inquiry) =>
    inquiry.id === action.id
      ? { ...inquiry, status: action.status, updatedAt: new Date() }
      : inquiry
  );
}
