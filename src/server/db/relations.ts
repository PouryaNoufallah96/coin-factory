import "server-only";

import { defineRelations } from "drizzle-orm";

// biome-ignore lint/performance/noNamespaceImport: defineRelations consumes the schema barrel wholesale (server-only, no tree-shaking concern)
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  user: {
    accounts: r.many.account(),
    sessions: r.many.session(),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  questions: {
    answers: r.many.inquiryAnswers(),
  },
  categories: {
    picks: r.many.inquiryCategories(),
  },
  inquiries: {
    answers: r.many.inquiryAnswers(),
    categoryPicks: r.many.inquiryCategories(),
    files: r.many.inquiryFiles(),
  },
  inquiryAnswers: {
    inquiry: r.one.inquiries({
      from: r.inquiryAnswers.inquiryId,
      to: r.inquiries.id,
    }),
    question: r.one.questions({
      from: r.inquiryAnswers.questionId,
      to: r.questions.id,
    }),
  },
  inquiryCategories: {
    inquiry: r.one.inquiries({
      from: r.inquiryCategories.inquiryId,
      to: r.inquiries.id,
    }),
    category: r.one.categories({
      from: r.inquiryCategories.categoryId,
      to: r.categories.id,
    }),
  },
  inquiryFiles: {
    inquiry: r.one.inquiries({
      from: r.inquiryFiles.inquiryId,
      to: r.inquiries.id,
    }),
  },
}));
