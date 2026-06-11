import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { id, softDelete, timestamps } from "./helpers";

export const categories = pgTable(
  "categories",
  {
    ...id,
    label: text().notNull(),
    sortOrder: integer().notNull(),
    active: boolean().notNull().default(true),
    ...softDelete,
    ...timestamps,
  },
  (table) => [
    uniqueIndex("categories_sort_order_live_unique")
      .on(table.sortOrder)
      .where(sql`${table.deletedAt} is null`),
    // Two live labels differing only in case/whitespace would make landing
    // picks and snapshot badges ambiguous.
    uniqueIndex("categories_label_live_unique")
      .on(sql`lower(btrim(${table.label}))`)
      .where(sql`${table.deletedAt} is null`),
  ]
);
