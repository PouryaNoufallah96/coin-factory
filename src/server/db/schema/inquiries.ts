import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { id, timestamps } from "./helpers";

export const inquiryStatuses = [
  "new",
  "reviewed",
  "contacted",
  "closed",
] as const;

export type InquiryStatus = (typeof inquiryStatuses)[number];

export const inquiryStatus = pgEnum("inquiry_status", inquiryStatuses);

export const inquiries = pgTable("inquiries", {
  ...id,
  assetDescription: text(),
  email: text().notNull(),
  whatsapp: text().notNull(),
  status: inquiryStatus().notNull().default("new"),
  // Null until the submission email actually sent; the admin list flags
  // not-yet-emailed rows from it.
  notifiedAt: timestamp({ withTimezone: true }),
  notificationAttemptedAt: timestamp({ withTimezone: true }),
  notificationError: text(),
  ...timestamps,
});
