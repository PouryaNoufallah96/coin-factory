import "server-only";

import { asc, eq, isNull, sql } from "drizzle-orm";
import type { AnyPgColumn, AnyPgTable } from "drizzle-orm/pg-core";

import { type DbExecutor, db } from "@/server/db";

const TEMP_SORT_OFFSET = 10_000;

interface OrderedEntityTable extends AnyPgTable {
  deletedAt: AnyPgColumn;
  id: AnyPgColumn;
  sortOrder: AnyPgColumn;
  updatedAt: AnyPgColumn;
}

export class OrderedEntitySetMismatchError extends Error {
  constructor(entityName: string) {
    super(`The ordered ${entityName} list is stale. Refresh and try again.`);
    this.name = "OrderedEntitySetMismatchError";
  }
}

export function appendSortOrderSql(table: OrderedEntityTable) {
  return sql<number>`(
    select coalesce(max(${table.sortOrder}), 0) + 1
    from ${table}
    where ${table.deletedAt} is null
  )`;
}

export async function reorderOrderedEntity(
  table: OrderedEntityTable,
  ids: readonly string[],
  entityName: string,
  executor: DbExecutor = db
) {
  const reorder = async (tx: DbExecutor) => {
    const currentRows = await tx
      .select({ id: table.id })
      .from(table)
      .where(isNull(table.deletedAt))
      .orderBy(asc(table.sortOrder));
    const currentIds = currentRows.map((row) => String(row.id));

    assertSameOrderedSet(currentIds, ids, entityName);

    await tx
      .update(table)
      .set({
        sortOrder: sql`${table.sortOrder} + ${TEMP_SORT_OFFSET}`,
        updatedAt: new Date(),
      })
      .where(isNull(table.deletedAt));

    for (const [index, id] of ids.entries()) {
      await tx
        .update(table)
        .set({ sortOrder: index + 1, updatedAt: new Date() })
        .where(eq(table.id, id));
    }
  };

  if (hasTransaction(executor)) {
    await executor.transaction(reorder);
    return;
  }

  await reorder(executor);
}

interface TransactionCapableExecutor {
  transaction<T>(callback: (tx: DbExecutor) => Promise<T>): Promise<T>;
}

function hasTransaction(
  executor: DbExecutor
): executor is DbExecutor & TransactionCapableExecutor {
  return (
    "transaction" in executor && typeof executor.transaction === "function"
  );
}

function assertSameOrderedSet(
  currentIds: readonly string[],
  nextIds: readonly string[],
  entityName: string
) {
  if (currentIds.length !== nextIds.length) {
    throw new OrderedEntitySetMismatchError(entityName);
  }

  const current = new Set(currentIds);
  const next = new Set(nextIds);

  if (next.size !== nextIds.length || current.size !== next.size) {
    throw new OrderedEntitySetMismatchError(entityName);
  }

  for (const id of current) {
    if (!next.has(id)) {
      throw new OrderedEntitySetMismatchError(entityName);
    }
  }
}
