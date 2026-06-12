import type { AdminInquiryDetail } from "@/features/inquiries/schemas/admin-inquiry";

export interface SubmissionEmailProps {
  appBaseUrl: string;
  inquiry: AdminInquiryDetail;
}

const utcDateTimeFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function buildSubmissionEmailText({
  appBaseUrl,
  inquiry,
}: SubmissionEmailProps) {
  const lines = [
    "New CoinFactory inquiry",
    "",
    `View full submission: ${adminInquiryUrl(appBaseUrl, inquiry.id)}`,
    "",
    "Contact",
    `Email: ${inquiry.email}`,
    `WhatsApp: ${inquiry.whatsapp}`,
    `Submitted: ${formatDateTime(inquiry.createdAt)}`,
    "",
    "Asset description",
    inquiry.assetDescription || "Not provided",
    "",
    "Business categories",
    inquiry.categories.length > 0
      ? inquiry.categories.map((category) => category.label).join(", ")
      : "None picked",
    "",
    "Answers",
    ...inquiry.answers.flatMap((answer) => [
      answer.questionText,
      answer.value,
      "",
    ]),
    "Documents",
    ...documentTextLines(appBaseUrl, inquiry.files),
  ];

  return lines.join("\n").trim();
}

function documentTextLines(
  appBaseUrl: string,
  files: AdminInquiryDetail["files"]
) {
  if (files.length === 0) {
    return ["No supporting documents."];
  }

  return files.flatMap((file) => [
    `${file.filename} (${file.contentType}, ${formatBytes(file.sizeBytes)})`,
    adminFileUrl(appBaseUrl, file.id),
    "",
  ]);
}

export function adminInquiryUrl(appBaseUrl: string, inquiryId: string) {
  return absoluteAdminUrl(appBaseUrl, `/admin/inquiries/${inquiryId}`);
}

export function adminFileUrl(appBaseUrl: string, fileId: string) {
  return absoluteAdminUrl(appBaseUrl, `/admin/files/${fileId}`);
}

function absoluteAdminUrl(appBaseUrl: string, path: string) {
  return new URL(path, appBaseUrl).toString();
}

export function formatDateTime(date: Date) {
  return utcDateTimeFormatter.format(date);
}

export function formatBytes(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
