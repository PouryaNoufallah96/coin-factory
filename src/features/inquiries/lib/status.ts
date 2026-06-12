import type { InquiryStatus } from "@/server/db/schema";

export const inquiryStatusLabels = {
  new: "New",
  reviewed: "Reviewed",
  contacted: "Contacted",
  closed: "Closed",
} satisfies Record<InquiryStatus, string>;

const nextStatusByStatus = {
  new: "reviewed",
  reviewed: "contacted",
  contacted: "closed",
  closed: null,
} satisfies Record<InquiryStatus, InquiryStatus | null>;

export class InquiryStatusTransitionError extends Error {
  constructor(current: InquiryStatus, next: InquiryStatus) {
    super(
      `Inquiry status can only move from ${inquiryStatusLabels[current]} to ${
        nextStatusByStatus[current]
          ? inquiryStatusLabels[nextStatusByStatus[current]]
          : "no next status"
      }, not to ${inquiryStatusLabels[next]}.`
    );
    this.name = "InquiryStatusTransitionError";
  }
}

export function nextInquiryStatus(status: InquiryStatus) {
  return nextStatusByStatus[status];
}
