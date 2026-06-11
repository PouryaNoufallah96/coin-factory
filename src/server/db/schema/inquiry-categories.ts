import { index, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";

import { categories } from "./categories";
import { inquiries } from "./inquiries";

export const inquiryCategories = pgTable(
  "inquiry_categories",
  {
    inquiryId: uuid()
      .notNull()
      .references(() => inquiries.id, { onDelete: "cascade" }),
    categoryId: uuid()
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    // Snapshot of categories.label at submit time — a later rename never
    // rewrites what a founder picked.
    label: text().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.inquiryId, table.categoryId] }),
    index("inquiry_categories_category_id_idx").on(table.categoryId),
  ]
);
