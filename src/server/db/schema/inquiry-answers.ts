import { index, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";

import { inquiries } from "./inquiries";
import { questions } from "./questions";

export const inquiryAnswers = pgTable(
  "inquiry_answers",
  {
    inquiryId: uuid()
      .notNull()
      .references(() => inquiries.id, { onDelete: "cascade" }),
    // Restrict, not cascade: questions are only ever soft-deleted, so a
    // physical delete reaching this FK is a bug worth failing loudly on.
    questionId: uuid()
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    value: text().notNull(),
    // Snapshot of questions.text at submit time — admin edits never rewrite
    // what a past founder was asked.
    questionText: text().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.inquiryId, table.questionId] }),
    index("inquiry_answers_question_id_idx").on(table.questionId),
  ]
);
