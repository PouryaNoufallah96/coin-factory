import { sql } from "drizzle-orm";
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { createdAt, id } from "./helpers";

export const notificationRecipients = pgTable(
  "notification_recipients",
  {
    ...id,
    email: text().notNull(),
    ...createdAt,
  },
  (table) => [
    uniqueIndex("notification_recipients_email_normalized_unique").on(
      sql`lower(btrim(${table.email}))`
    ),
  ]
);
