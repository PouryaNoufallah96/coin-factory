import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { idTag } from "@/lib/cache-tags";
import { questionTags } from "../../db/cache/tags";
import { listAdminQuestions } from "../../db/queries";
import {
  type AdminQuestionListInput,
  adminQuestionListInputSchema,
  adminQuestionListOutputSchema,
} from "../../schemas/question";

export async function getAdminQuestions(input: AdminQuestionListInput) {
  "use cache";
  cacheTag(questionTags.adminList());
  cacheLife("hours");
  const parsedInput = adminQuestionListInputSchema.parse(input);
  const data = adminQuestionListOutputSchema.parse(
    await listAdminQuestions(parsedInput)
  );

  for (const row of data.rows) {
    cacheTag(idTag("question", row.id));
  }

  return data;
}
