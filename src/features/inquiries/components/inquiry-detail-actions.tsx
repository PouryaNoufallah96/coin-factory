"use client";

import { ArrowRight, Send } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { AdminActionErrorBanner } from "@/features/admin/components/admin-action-error-banner";
import { runInquiryRowAction } from "@/features/inquiries/actions/admin-inquiry-actions";
import { InquiryStatusBadge } from "@/features/inquiries/components/inquiry-status-badge";
import {
  inquiryStatusLabels,
  nextInquiryStatus,
} from "@/features/inquiries/lib/status";
import type { AdminInquiryDetail } from "@/features/inquiries/schemas/admin-inquiry";
import { useAction } from "@/hooks/use-action";

interface InquiryDetailActionsProps {
  inquiry: Pick<AdminInquiryDetail, "id" | "notifiedAt" | "status">;
}

export function InquiryDetailActions({ inquiry }: InquiryDetailActionsProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    inquiry.status,
    (_state, status: AdminInquiryDetail["status"]) => status
  );
  const [isOptimisticPending, startOptimisticTransition] = useTransition();
  const rowAction = useAction(runInquiryRowAction);
  const isPending = rowAction.isPending || isOptimisticPending;
  const nextStatus = nextInquiryStatus(optimisticStatus);

  async function markNextStatus() {
    if (!nextStatus) {
      return;
    }

    startOptimisticTransition(() => {
      setOptimisticStatus(nextStatus);
    });
    setActionError(null);

    const result = await rowAction.execute({
      id: inquiry.id,
      status: nextStatus,
      type: "setStatus",
    });

    if (result.status === "error") {
      setActionError(result.errorMessage ?? "Action failed.");
      startOptimisticTransition(() => {
        setOptimisticStatus(inquiry.status);
      });
    }
  }

  async function resendEmail() {
    setActionError(null);
    const result = await rowAction.execute({
      id: inquiry.id,
      type: "resendNotification",
    });

    if (result.status === "error") {
      setActionError(result.errorMessage ?? "Email could not be resent.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <InquiryStatusBadge status={optimisticStatus} />
        {nextStatus ? (
          <Button disabled={isPending} onClick={markNextStatus} type="button">
            <ArrowRight data-icon="inline-start" />
            Mark {inquiryStatusLabels[nextStatus].toLowerCase()}
          </Button>
        ) : null}
        {inquiry.notifiedAt ? null : (
          <Button
            disabled={isPending}
            onClick={resendEmail}
            type="button"
            variant="outline"
          >
            <Send data-icon="inline-start" />
            Resend email
          </Button>
        )}
      </div>
      {actionError ? <AdminActionErrorBanner message={actionError} /> : null}
    </div>
  );
}
