import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { id, softDelete, timestamps } from "./helpers";

export const questionKinds = ["radio", "url", "contact"] as const;

export type QuestionKind = (typeof questionKinds)[number];

export const questionKind = pgEnum("question_kind", questionKinds);

export const questions = pgTable(
  "questions",
  {
    ...id,
    sortOrder: integer().notNull(),
    text: text().notNull(),
    kind: questionKind().notNull(),
    options: text().array(),
    active: boolean().notNull().default(true),
    ...softDelete,
    ...timestamps,
  },
  (table) => [
    // Soft-deleted rows keep their old slot, so uniqueness only holds among
    // live rows; reorders must temp-offset inside one transaction.
    uniqueIndex("questions_sort_order_live_unique")
      .on(table.sortOrder)
      .where(sql`${table.deletedAt} is null`),
    check(
      "questions_kind_options_check",
      sql`(${table.kind} = 'radio' and ${table.options} is not null and cardinality(${table.options}) > 0) or (${table.kind} in ('url', 'contact') and ${table.options} is null)`
    ),
  ]
);
