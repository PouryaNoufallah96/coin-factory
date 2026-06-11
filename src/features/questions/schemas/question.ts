import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

import { questionKinds, questions } from "@/server/db/schema";

export const questionKindSchema = z.enum(questionKinds);

export const questionSchema = createSelectSchema(questions);

export type Question = z.infer<typeof questionSchema>;

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
