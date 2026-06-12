import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import {
  InquiryStatusTransitionError,
  nextInquiryStatus,
} from "@/features/inquiries/lib/status";
import { type DbExecutor, db } from "@/server/db";
import { likePattern, whereLive } from "@/server/db/filters";
import type { InquiryStatus } from "@/server/db/schema";
import {
  categories,
  inquiries,
  inquiryAnswers,
  inquiryCategories,
  inquiryFiles,
  questions,
} from "@/server/db/schema";

import type { AdminInquiryListInput } from "../schemas/admin-inquiry";

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

export async function listAdminInquiries(
  input: AdminInquiryListInput,
  executor: DbExecutor = db
) {
  const where = adminInquiryWhere(input);
  const orderBy = adminInquiryOrderBy(input);
  const offset = (input.page - 1) * input.pageSize;

  const [rows, total] = await Promise.all([
    executor
      .select({
        id: inquiries.id,
        assetDescription: inquiries.assetDescription,
        email: inquiries.email,
        whatsapp: inquiries.whatsapp,
        status: inquiries.status,
        notifiedAt: inquiries.notifiedAt,
        notificationAttemptedAt: inquiries.notificationAttemptedAt,
        notificationError: inquiries.notificationError,
        createdAt: inquiries.createdAt,
        updatedAt: inquiries.updatedAt,
      })
      .from(inquiries)
      .where(where)
      .orderBy(orderBy)
      .limit(input.pageSize)
      .offset(offset),
    executor.select({ totalRows: count() }).from(inquiries).where(where),
  ]);

  return {
    rows,
    totalRows: total[0]?.totalRows ?? 0,
  };
}

export async function getAdminInquiryDetail(
  id: string,
  executor: DbExecutor = db
) {
  const [inquiry] = await executor
    .select({
      id: inquiries.id,
      assetDescription: inquiries.assetDescription,
      email: inquiries.email,
      whatsapp: inquiries.whatsapp,
      status: inquiries.status,
      notifiedAt: inquiries.notifiedAt,
      notificationAttemptedAt: inquiries.notificationAttemptedAt,
      notificationError: inquiries.notificationError,
      createdAt: inquiries.createdAt,
      updatedAt: inquiries.updatedAt,
    })
    .from(inquiries)
    .where(eq(inquiries.id, id))
    .limit(1);

  if (!inquiry) {
    return null;
  }

  const [answers, pickedCategories, files] = await Promise.all([
    executor
      .select({
        questionId: inquiryAnswers.questionId,
        questionText: inquiryAnswers.questionText,
        value: inquiryAnswers.value,
      })
      .from(inquiryAnswers)
      .leftJoin(questions, eq(inquiryAnswers.questionId, questions.id))
      .where(eq(inquiryAnswers.inquiryId, id))
      .orderBy(asc(questions.sortOrder), asc(inquiryAnswers.questionText)),
    executor
      .select({
        categoryId: inquiryCategories.categoryId,
        label: inquiryCategories.label,
      })
      .from(inquiryCategories)
      .leftJoin(categories, eq(inquiryCategories.categoryId, categories.id))
      .where(eq(inquiryCategories.inquiryId, id))
      .orderBy(asc(categories.sortOrder), asc(inquiryCategories.label)),
    executor
      .select({
        id: inquiryFiles.id,
        filename: inquiryFiles.filename,
        contentType: inquiryFiles.contentType,
        sizeBytes: inquiryFiles.sizeBytes,
        createdAt: inquiryFiles.createdAt,
      })
      .from(inquiryFiles)
      .where(eq(inquiryFiles.inquiryId, id))
      .orderBy(asc(inquiryFiles.createdAt)),
  ]);

  return {
    ...inquiry,
    answers,
    categories: pickedCategories,
    files,
  };
}

export function getSubmissionEmailSnapshot(
  inquiryId: string,
  executor: DbExecutor = db
) {
  return getAdminInquiryDetail(inquiryId, executor);
}

export async function getAdminInquiryFile(
  id: string,
  executor: DbExecutor = db
) {
  const [file] = await executor
    .select({
      id: inquiryFiles.id,
      inquiryId: inquiryFiles.inquiryId,
      storageKey: inquiryFiles.storageKey,
      filename: inquiryFiles.filename,
      contentType: inquiryFiles.contentType,
      sizeBytes: inquiryFiles.sizeBytes,
      createdAt: inquiryFiles.createdAt,
    })
    .from(inquiryFiles)
    .where(eq(inquiryFiles.id, id))
    .limit(1);

  return file ?? null;
}

export async function getInquiryNotificationState(
  id: string,
  executor: DbExecutor = db
) {
  const [inquiry] = await executor
    .select({
      id: inquiries.id,
      notifiedAt: inquiries.notifiedAt,
      notificationAttemptedAt: inquiries.notificationAttemptedAt,
      notificationError: inquiries.notificationError,
    })
    .from(inquiries)
    .where(eq(inquiries.id, id))
    .limit(1);

  return inquiry ?? null;
}

export async function setAdminInquiryStatus(
  values: { id: string; status: InquiryStatus },
  executor: DbExecutor = db
) {
  const [current] = await executor
    .select({ status: inquiries.status })
    .from(inquiries)
    .where(eq(inquiries.id, values.id))
    .limit(1);

  if (!current) {
    return null;
  }

  if (nextInquiryStatus(current.status) !== values.status) {
    throw new InquiryStatusTransitionError(current.status, values.status);
  }

  const [updated] = await executor
    .update(inquiries)
    .set({ status: values.status, updatedAt: new Date() })
    .where(
      and(eq(inquiries.id, values.id), eq(inquiries.status, current.status))
    )
    .returning();

  return updated ?? null;
}

function adminInquiryWhere(input: AdminInquiryListInput): SQL | undefined {
  const search = input.search.trim();

  if (!search) {
    return;
  }

  const pattern = likePattern(search);

  return or(
    ilike(inquiries.email, pattern),
    ilike(inquiries.whatsapp, pattern),
    ilike(inquiries.assetDescription, pattern)
  );
}

function adminInquiryOrderBy(input: AdminInquiryListInput): SQL {
  if (input.orderBy === "email") {
    return input.orderDirection === "desc"
      ? desc(inquiries.email)
      : asc(inquiries.email);
  }

  if (input.orderBy === "assetDescription") {
    return input.orderDirection === "desc"
      ? desc(inquiries.assetDescription)
      : asc(inquiries.assetDescription);
  }

  if (input.orderBy === "status") {
    return input.orderDirection === "desc"
      ? desc(inquiries.status)
      : asc(inquiries.status);
  }

  if (input.orderBy === "notifiedAt") {
    return input.orderDirection === "desc"
      ? desc(inquiries.notifiedAt)
      : asc(inquiries.notifiedAt);
  }

  return input.orderDirection === "asc"
    ? asc(inquiries.createdAt)
    : desc(inquiries.createdAt);
}
