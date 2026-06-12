import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  type SQL,
} from "drizzle-orm";

import {
  appendSortOrderSql,
  reorderOrderedEntity,
} from "@/features/admin/db/ordered-entity";
import { type DbExecutor, db } from "@/server/db";
import { whereLive } from "@/server/db/filters";
import { questions } from "@/server/db/schema";

import type { AdminQuestionListInput } from "../schemas/question";

export function listActiveQuestions(executor: DbExecutor = db) {
  return executor
    .select()
    .from(questions)
    .where(whereLive(questions))
    .orderBy(asc(questions.sortOrder));
}

export async function listAdminQuestions(
  input: AdminQuestionListInput,
  executor: DbExecutor = db
) {
  const where = adminQuestionWhere(input);
  const orderBy = adminQuestionOrderBy(input);
  const offset = (input.page - 1) * input.pageSize;

  const [rows, total, orderedRows] = await Promise.all([
    executor
      .select()
      .from(questions)
      .where(where)
      .orderBy(orderBy)
      .limit(input.pageSize)
      .offset(offset),
    executor.select({ totalRows: count() }).from(questions).where(where),
    input.showDeleted
      ? Promise.resolve([])
      : executor
          .select({ id: questions.id })
          .from(questions)
          .where(isNull(questions.deletedAt))
          .orderBy(asc(questions.sortOrder)),
  ]);

  return {
    orderedIds: orderedRows.map((row) => row.id),
    rows,
    totalRows: total[0]?.totalRows ?? 0,
  };
}

export async function createQuestion(
  values: {
    kind: "contact" | "radio" | "url";
    options: string[] | null;
    text: string;
  },
  executor: DbExecutor = db
) {
  const [created] = await executor
    .insert(questions)
    .values({
      ...values,
      sortOrder: appendSortOrderSql(questions),
    })
    .returning();

  return created ?? null;
}

export async function updateQuestion(
  values: {
    id: string;
    kind: "contact" | "radio" | "url";
    options: string[] | null;
    text: string;
  },
  executor: DbExecutor = db
) {
  const [updated] = await executor
    .update(questions)
    .set({
      kind: values.kind,
      options: values.options,
      text: values.text,
      updatedAt: new Date(),
    })
    .where(and(eq(questions.id, values.id), isNull(questions.deletedAt)))
    .returning();

  return updated ?? null;
}

export async function setQuestionActive(
  values: { active: boolean; id: string },
  executor: DbExecutor = db
) {
  const [updated] = await executor
    .update(questions)
    .set({ active: values.active, updatedAt: new Date() })
    .where(and(eq(questions.id, values.id), isNull(questions.deletedAt)))
    .returning();

  return updated ?? null;
}

export async function softDeleteQuestion(
  id: string,
  executor: DbExecutor = db
) {
  const [deleted] = await executor
    .update(questions)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(questions.id, id), isNull(questions.deletedAt)))
    .returning();

  return deleted ?? null;
}

export async function restoreQuestion(id: string, executor: DbExecutor = db) {
  const [restored] = await executor
    .update(questions)
    .set({
      deletedAt: null,
      sortOrder: appendSortOrderSql(questions),
      updatedAt: new Date(),
    })
    .where(and(eq(questions.id, id), isNotNull(questions.deletedAt)))
    .returning();

  return restored ?? null;
}

export function reorderQuestions(
  ids: readonly string[],
  executor: DbExecutor = db
) {
  return reorderOrderedEntity(questions, ids, "questions", executor);
}

function adminQuestionWhere(input: AdminQuestionListInput): SQL | undefined {
  const lifecycle = input.showDeleted
    ? isNotNull(questions.deletedAt)
    : isNull(questions.deletedAt);
  const search = input.search.trim();

  if (!search) {
    return lifecycle;
  }

  return and(lifecycle, ilike(questions.text, likePattern(search)));
}

function adminQuestionOrderBy(input: AdminQuestionListInput): SQL {
  if (input.orderBy === "text") {
    return input.orderDirection === "desc"
      ? desc(questions.text)
      : asc(questions.text);
  }

  if (input.orderBy === "kind") {
    return input.orderDirection === "desc"
      ? desc(questions.kind)
      : asc(questions.kind);
  }

  if (input.orderBy === "active") {
    return input.orderDirection === "desc"
      ? desc(questions.active)
      : asc(questions.active);
  }

  if (input.orderBy === "createdAt") {
    return input.orderDirection === "desc"
      ? desc(questions.createdAt)
      : asc(questions.createdAt);
  }

  return input.orderDirection === "desc"
    ? desc(questions.sortOrder)
    : asc(questions.sortOrder);
}

function likePattern(value: string) {
  return `%${value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
}
