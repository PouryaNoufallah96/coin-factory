import { ArrowLeft, Download } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAdminDate } from "@/features/admin/lib/format-admin-date";
import { CopyToClipboardButton } from "@/features/inquiries/components/copy-to-clipboard-button";
import { InquiryDetailActions } from "@/features/inquiries/components/inquiry-detail-actions";
import type { AdminInquiryDetail } from "@/features/inquiries/schemas/admin-inquiry";

interface InquiryDetailProps {
  inquiry: AdminInquiryDetail;
  showHeader?: boolean;
}

export function InquiryDetail({
  inquiry,
  showHeader = true,
}: InquiryDetailProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      {showHeader ? (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <Button
              className="mb-1 w-fit"
              nativeButton={false}
              render={<Link href="/admin/inquiries" />}
              size="sm"
              variant="ghost"
            >
              <ArrowLeft data-icon="inline-start" />
              Inquiries
            </Button>
            <h1 className="font-semibold text-2xl text-cf-text-primary tracking-normal sm:text-3xl">
              Inquiry details
            </h1>
            <p className="text-cf-text-muted text-sm">
              {formatAdminDate(inquiry.createdAt)}
            </p>
          </div>
          <InquiryDetailActions inquiry={inquiry} />
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-cf-text-muted text-sm">
            {formatAdminDate(inquiry.createdAt)}
          </p>
          <InquiryDetailActions inquiry={inquiry} />
        </div>
      )}

      <section className="grid gap-4 border-cf-border-muted/40 border-y py-5 sm:grid-cols-2">
        <DetailItem label="Email" value={inquiry.email} withCopy />
        <DetailItem label="WhatsApp" value={inquiry.whatsapp} withCopy />
        <DetailItem
          label="Notification"
          value={inquiry.notifiedAt ? "Sent" : "Not emailed"}
        />
        <DetailItem
          label="Updated"
          value={formatAdminDate(inquiry.updatedAt)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-cf-text-primary text-lg">
          Description
        </h2>
        <p className="max-w-3xl whitespace-pre-wrap text-cf-text-muted text-sm leading-6">
          {inquiry.assetDescription ?? "-"}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-cf-text-primary text-lg">Files</h2>
        {inquiry.files.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {inquiry.files.map((file) => (
              <div
                className="flex items-center justify-between gap-3 rounded-(--cf-radius-card) border border-cf-border-muted/40 bg-card p-4"
                key={file.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-cf-text-primary text-sm">
                    {file.filename}
                  </p>
                  <p className="text-cf-text-muted text-xs">
                    {file.contentType} - {formatFileSize(file.sizeBytes)}
                  </p>
                </div>
                <Button
                  aria-label={`Download ${file.filename}`}
                  nativeButton={false}
                  render={<Link href={`/admin/files/${file.id}` as Route} />}
                  size="icon-sm"
                  variant="outline"
                >
                  <Download aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-cf-text-muted text-sm">No files attached</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-cf-text-primary text-lg">Categories</h2>
        {inquiry.categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {inquiry.categories.map((category) => (
              <Badge key={category.categoryId} variant="outline">
                {category.label}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-cf-text-muted text-sm">No categories selected</p>
        )}
      </section>

      <hr className="border-cf-border-muted/40" />

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-cf-text-primary text-lg">Answers</h2>
        {inquiry.answers.length > 0 ? (
          <div className="grid gap-3">
            {inquiry.answers.map((answer) => (
              <div
                className="rounded-(--cf-radius-card) border border-cf-border-muted/40 bg-card p-4"
                key={answer.questionId}
              >
                <p className="text-cf-text-muted text-xs uppercase tracking-wide">
                  {answer.questionText}
                </p>
                <p className="mt-1.5 whitespace-pre-wrap font-medium text-base text-cf-text-primary leading-6">
                  {answer.value}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-cf-text-muted text-sm">No answers saved</p>
        )}
      </section>
    </div>
  );
}

function DetailItem({
  label,
  value,
  withCopy = false,
}: {
  label: string;
  value: string;
  withCopy?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-cf-text-muted text-xs">{label}</p>
      <div className="flex min-w-0 items-center gap-1">
        <p className="truncate text-cf-text-primary text-sm">{value}</p>
        {withCopy ? (
          <CopyToClipboardButton label={label} value={value} />
        ) : null}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(Math.round(bytes / 1024), 1)} KB`;
}
