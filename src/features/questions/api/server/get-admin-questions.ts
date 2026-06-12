import "server-only";

import { createRequestOrpcServer } from "@/lib/orpc.server";

import type { AdminQuestionListInput } from "../../schemas/question";

export async function getAdminQuestions(input: AdminQuestionListInput) {
  const orpc = await createRequestOrpcServer();

  return await orpc.questions.admin.list(input);
}
