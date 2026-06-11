import "server-only";

import { and, eq, inArray, sql } from "drizzle-orm";

import { type DbExecutor, db } from "@/server/db";
import { whereLive } from "@/server/db/filters";
import {
  categories,
  inquiries,
  inquiryAnswers,
  inquiryCategories,
  inquiryFiles,
} from "@/server/db/schema";

export type InquiryInsert = typeof inquiries.$inferInsert;
export type InquiryAnswerInsert = typeof inquiryAnswers.$inferInsert;
export type InquiryFileInsert = typeof inquiryFiles.$inferInsert;

export async function insertInquiry(
  values: InquiryInsert,
  executor: DbExecutor = db
): Promise<void> {
  await executor.insert(inquiries).values(values);
}

export async function insertInquiryAnswers(
  rows: InquiryAnswerInsert[],
  executor: DbExecutor = db
): Promise<void> {
  if (rows.length === 0) {
    return;
  }
  await executor.insert(inquiryAnswers).values(rows);
}

export async function insertInquiryFiles(
  rows: InquiryFileInsert[],
  executor: DbExecutor = db
): Promise<void> {
  if (rows.length === 0) {
    return;
  }
  await executor.insert(inquiryFiles).values(rows);
}

export interface InquiryNotificationOutcome {
  notificationAttemptedAt: Date;
  notificationError: string | null;
  notifiedAt: Date | null;
}

export async function setInquiryNotificationOutcome(
  inquiryId: string,
  outcome: InquiryNotificationOutcome,
  executor: DbExecutor = db
): Promise<void> {
  await executor
    .update(inquiries)
    .set(outcome)
    .where(eq(inquiries.id, inquiryId));
}

/**
 * Copies each picked category's current label into the join row atomically
 * (INSERT … SELECT — no read-then-write race). Returns the inserted count:
 * when it differs from the deduped input count, a pick went inactive
 * mid-submit and the caller must abort instead of silently dropping it.
 */
export async function insertInquiryCategoryPicks(
  inquiryId: string,
  categoryIds: readonly string[],
  executor: DbExecutor = db
): Promise<number> {
  if (categoryIds.length === 0) {
    return 0;
  }
  const inserted = await executor
    .insert(inquiryCategories)
    .select((qb) =>
      qb
        .select({
          inquiryId: sql`${inquiryId}::uuid`.as("inquiry_id"),
          categoryId: categories.id,
          label: categories.label,
        })
        .from(categories)
        .where(
          and(inArray(categories.id, [...categoryIds]), whereLive(categories))
        )
    )
    .returning({ categoryId: inquiryCategories.categoryId });
  return inserted.length;
}
