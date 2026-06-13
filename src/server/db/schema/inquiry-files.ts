import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { createdAt, id } from "./helpers";
import { inquiries } from "./inquiries";

export const inquiryFiles = pgTable(
  "inquiry_files",
  {
    ...id,
    inquiryId: uuid()
      .notNull()
      .references(() => inquiries.id, { onDelete: "cascade" }),
    storageKey: text().notNull().unique(),
    // Display metadata only — the object itself lives in storage under
    // storageKey, and contentType is server-normalized after sniffing.
    filename: text().notNull(),
    contentType: text().notNull(),
    sizeBytes: integer().notNull(),
    ...createdAt,
  },
  (table) => [
    index("inquiry_files_inquiry_id_idx").on(table.inquiryId),
    check("inquiry_files_size_bytes_check", sql`${table.sizeBytes} > 0`),
  ]
);
