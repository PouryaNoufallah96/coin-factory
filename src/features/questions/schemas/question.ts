import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

import {
  createAdminListInputSchema,
  createAdminListOutputSchema,
  createReorderInputSchema,
  entityIdInputSchema,
  setEntityActiveInputSchema,
} from "@/features/admin/schemas/ordered-entity-list";
import { questionKinds, questions } from "@/server/db/schema";

const questionOrderBy = [
  "text",
  "kind",
  "sortOrder",
  "active",
  "createdAt",
] as const;

export const questionKindSchema = z.enum(questionKinds);

export type QuestionKind = z.infer<typeof questionKindSchema>;

export const questionSchema = createSelectSchema(questions);

export type Question = z.infer<typeof questionSchema>;

/** What the funnel is allowed to see — admin lifecycle columns stay server-side. */
export const publicQuestionSchema = questionSchema.pick({
  id: true,
  sortOrder: true,
  text: true,
  kind: true,
  options: true,
});

export type PublicQuestion = z.infer<typeof publicQuestionSchema>;

export const adminQuestionSchema = questionSchema.pick({
  id: true,
  sortOrder: true,
  text: true,
  kind: true,
  options: true,
  active: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type AdminQuestion = z.infer<typeof adminQuestionSchema>;

export const adminQuestionListInputSchema =
  createAdminListInputSchema(questionOrderBy);

export type AdminQuestionListInput = z.infer<
  typeof adminQuestionListInputSchema
>;

export const adminQuestionListOutputSchema =
  createAdminListOutputSchema(adminQuestionSchema);

const questionTextSchema = z
  .string()
  .trim()
  .min(1, "Enter the question text.")
  .max(240, "Keep the question under 240 characters.");

const questionOptionSchema = z
  .string()
  .trim()
  .min(1, "Remove empty options.")
  .max(120, "Keep each option under 120 characters.");

const questionMutationSchema = z
  .object({
    kind: questionKindSchema,
    options: questionOptionSchema.array().max(12).nullable(),
    text: questionTextSchema,
  })
  .transform((value) => ({
    ...value,
    options: value.kind === "radio" ? value.options : null,
  }))
  .superRefine((value, ctx) => {
    if (
      value.kind === "radio" &&
      (!value.options || value.options.length < 1)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Add at least one radio option.",
        path: ["options"],
      });
    }
  });

export const createQuestionInputSchema = questionMutationSchema;

export const updateQuestionInputSchema = questionMutationSchema.and(
  z.object({ id: z.uuid() })
);

export const setQuestionActiveInputSchema = setEntityActiveInputSchema;

export const questionIdInputSchema = entityIdInputSchema;

export const reorderQuestionsInputSchema = createReorderInputSchema("question");

export type QuestionFormInput = z.input<typeof createQuestionInputSchema>;

/** Empty passes — the link question is optional ("if any"). */
export const optionalUrlSchema = z.literal("").or(z.url("Enter a valid link."));

function isNonEmpty(
  options: readonly string[]
): options is readonly [string, ...string[]] {
  return options.length > 0;
}

/**
 * Value validator for one answered question: radio answers must be one of the
 * question's own options; url answers pass when empty. Contact questions never
 * produce an answer row — their values live on the inquiry itself.
 */
export function questionAnswerValueSchema(
  question: Pick<Question, "kind" | "options">
): z.ZodType<string> {
  if (question.kind === "radio") {
    return question.options && isNonEmpty(question.options)
      ? z.enum(question.options)
      : z.never();
  }
  if (question.kind === "url") {
    return optionalUrlSchema;
  }
  return z.never();
}
