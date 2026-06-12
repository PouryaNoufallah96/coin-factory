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
import { categories } from "@/server/db/schema";

import type { AdminCategoryListInput } from "../schemas/category";

export function listActiveCategories(executor: DbExecutor = db) {
  return executor
    .select()
    .from(categories)
    .where(whereLive(categories))
    .orderBy(asc(categories.sortOrder));
}

export async function listAdminCategories(
  input: AdminCategoryListInput,
  executor: DbExecutor = db
) {
  const where = adminCategoryWhere(input);
  const orderBy = adminCategoryOrderBy(input);
  const offset = (input.page - 1) * input.pageSize;

  const [rows, total, orderedRows] = await Promise.all([
    executor
      .select()
      .from(categories)
      .where(where)
      .orderBy(orderBy)
      .limit(input.pageSize)
      .offset(offset),
    executor.select({ totalRows: count() }).from(categories).where(where),
    input.showDeleted
      ? Promise.resolve([])
      : executor
          .select({ id: categories.id })
          .from(categories)
          .where(isNull(categories.deletedAt))
          .orderBy(asc(categories.sortOrder)),
  ]);

  return {
    orderedIds: orderedRows.map((row) => row.id),
    rows,
    totalRows: total[0]?.totalRows ?? 0,
  };
}

export async function createCategory(
  values: { label: string },
  executor: DbExecutor = db
) {
  const [created] = await executor
    .insert(categories)
    .values({
      label: values.label,
      sortOrder: appendSortOrderSql(categories),
    })
    .returning();

  return created ?? null;
}

export async function updateCategory(
  values: { id: string; label: string },
  executor: DbExecutor = db
) {
  const [updated] = await executor
    .update(categories)
    .set({ label: values.label, updatedAt: new Date() })
    .where(and(eq(categories.id, values.id), isNull(categories.deletedAt)))
    .returning();

  return updated ?? null;
}

export async function setCategoryActive(
  values: { active: boolean; id: string },
  executor: DbExecutor = db
) {
  const [updated] = await executor
    .update(categories)
    .set({ active: values.active, updatedAt: new Date() })
    .where(and(eq(categories.id, values.id), isNull(categories.deletedAt)))
    .returning();

  return updated ?? null;
}

export async function softDeleteCategory(
  id: string,
  executor: DbExecutor = db
) {
  const [deleted] = await executor
    .update(categories)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
    .returning();

  return deleted ?? null;
}

export async function restoreCategory(id: string, executor: DbExecutor = db) {
  const [restored] = await executor
    .update(categories)
    .set({
      deletedAt: null,
      sortOrder: appendSortOrderSql(categories),
      updatedAt: new Date(),
    })
    .where(and(eq(categories.id, id), isNotNull(categories.deletedAt)))
    .returning();

  return restored ?? null;
}

export function reorderCategories(
  ids: readonly string[],
  executor: DbExecutor = db
) {
  return reorderOrderedEntity(categories, ids, "categories", executor);
}

function adminCategoryWhere(input: AdminCategoryListInput): SQL | undefined {
  const lifecycle = input.showDeleted
    ? isNotNull(categories.deletedAt)
    : isNull(categories.deletedAt);
  const search = input.search.trim();

  if (!search) {
    return lifecycle;
  }

  return and(lifecycle, ilike(categories.label, likePattern(search)));
}

function adminCategoryOrderBy(input: AdminCategoryListInput): SQL {
  if (input.orderBy === "label") {
    return input.orderDirection === "desc"
      ? desc(categories.label)
      : asc(categories.label);
  }

  if (input.orderBy === "active") {
    return input.orderDirection === "desc"
      ? desc(categories.active)
      : asc(categories.active);
  }

  if (input.orderBy === "createdAt") {
    return input.orderDirection === "desc"
      ? desc(categories.createdAt)
      : asc(categories.createdAt);
  }

  return input.orderDirection === "desc"
    ? desc(categories.sortOrder)
    : asc(categories.sortOrder);
}

function likePattern(value: string) {
  return `%${value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
}
