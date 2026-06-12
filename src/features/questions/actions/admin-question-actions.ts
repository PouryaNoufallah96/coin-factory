"use server";

import { headers } from "next/headers";

import { withAdminMutationRefresh } from "@/features/admin/actions/with-admin-mutation-refresh";
import type { AdminRowActionInput } from "@/features/admin/schemas/admin-row-action";
import { updateQuestionTags } from "@/features/questions/db/cache/tags";
import { createRpcContext } from "@/server/rpc/context";
import { appRouter } from "@/server/rpc/routers";

const actionOptions = {
  context: async () => createRpcContext({ headers: await headers() }),
};

export const createQuestion = withAdminMutationRefresh(
  appRouter.questions.admin.create.actionable(actionOptions),
  () => updateQuestionTags()
);

export const updateQuestion = withAdminMutationRefresh(
  appRouter.questions.admin.update.actionable(actionOptions),
  (input) => updateQuestionTags(input.id)
);

export const reorderQuestions = withAdminMutationRefresh(
  appRouter.questions.admin.reorder.actionable(actionOptions),
  () => updateQuestionTags()
);

export const setQuestionActive = withAdminMutationRefresh(
  appRouter.questions.admin.setActive.actionable(actionOptions),
  (input) => updateQuestionTags(input.id)
);

export const softDeleteQuestion = withAdminMutationRefresh(
  appRouter.questions.admin.softDelete.actionable(actionOptions),
  (input) => updateQuestionTags(input.id)
);

export const restoreQuestion = withAdminMutationRefresh(
  appRouter.questions.admin.restore.actionable(actionOptions),
  (input) => updateQuestionTags(input.id)
);

export type QuestionRowActionInput = AdminRowActionInput;

export async function runQuestionRowAction(input: QuestionRowActionInput) {
  switch (input.type) {
    case "reorder":
      return await reorderQuestions({ ids: input.ids });
    case "restore":
      return await restoreQuestion({ id: input.id });
    case "setActive":
      return await setQuestionActive({
        active: input.active,
        id: input.id,
      });
    case "softDelete":
      return await softDeleteQuestion({ id: input.id });
    default:
      throw new Error("Unsupported question row action.");
  }
}
