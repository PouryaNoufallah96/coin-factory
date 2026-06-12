import "server-only";

import { and, eq, isNull, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

interface SoftDeletable {
  deletedAt: AnyPgColumn;
}

interface Toggleable extends SoftDeletable {
  active: AnyPgColumn;
}

export function whereNotDeleted(table: SoftDeletable): SQL {
  return isNull(table.deletedAt);
}

/** Live = visible to public flows: enabled and not soft-deleted. */
export function whereLive(table: Toggleable): SQL | undefined {
  return and(eq(table.active, true), whereNotDeleted(table));
}

export function likePattern(value: string) {
  return `%${value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_")}%`;
}
