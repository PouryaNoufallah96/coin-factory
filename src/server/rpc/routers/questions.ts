import "server-only";

import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { OrderedEntitySetMismatchError } from "@/features/admin/db/ordered-entity";
import { revalidateQuestionTags } from "@/features/questions/db/cache/tags";
import {
  createQuestion,
  listActiveQuestions,
  listAdminQuestions,
  reorderQuestions,
  restoreQuestion,
  setQuestionActive,
  softDeleteQuestion,
  updateQuestion,
} from "@/features/questions/db/queries";
import {
  adminQuestionListInputSchema,
  adminQuestionListOutputSchema,
  createQuestionInputSchema,
  publicQuestionSchema,
  questionIdInputSchema,
  reorderQuestionsInputSchema,
  setQuestionActiveInputSchema,
  updateQuestionInputSchema,
} from "@/features/questions/schemas/question";

import { adminProcedure, publicProcedure, withIpThrottle } from "../middleware";

// Reads are cheap and cached for RSC consumers; the throttle only meters
// direct /rpc traffic.
const READ_LIMIT_PER_MINUTE = 60;
const READ_WINDOW_MS = 60_000;
const okOutput = z.object({ ok: z.literal(true) });

const listActive = publicProcedure
  .use(withIpThrottle("questions-read", READ_LIMIT_PER_MINUTE, READ_WINDOW_MS))
  .output(publicQuestionSchema.array())
  .handler(({ context }) => listActiveQuestions(context.db));

const listAdmin = adminProcedure
  .input(adminQuestionListInputSchema)
  .output(adminQuestionListOutputSchema)
  .handler(({ context, input }) => listAdminQuestions(input, context.db));

const create = adminProcedure
  .input(createQuestionInputSchema)
  .output(okOutput)
  .handler(async ({ context, input }) => {
    const created = await createQuestion(input, context.db);
    if (!created) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Question could not be created.",
      });
    }
    revalidateQuestionTags();
    return { ok: true };
  });

const update = adminProcedure
  .input(updateQuestionInputSchema)
  .output(okOutput)
  .handler(async ({ context, input }) => {
    const updated = await updateQuestion(input, context.db);
    if (!updated) {
      throw new ORPCError("NOT_FOUND", {
        message: "Question was not found.",
      });
    }
    revalidateQuestionTags();
    return { ok: true };
  });

const setActive = adminProcedure
  .input(setQuestionActiveInputSchema)
  .output(okOutput)
  .handler(async ({ context, input }) => {
    const updated = await setQuestionActive(input, context.db);
    if (!updated) {
      throw new ORPCError("NOT_FOUND", {
        message: "Question was not found.",
      });
    }
    revalidateQuestionTags();
    return { ok: true };
  });

const softDelete = adminProcedure
  .input(questionIdInputSchema)
  .output(okOutput)
  .handler(async ({ context, input }) => {
    const deleted = await softDeleteQuestion(input.id, context.db);
    if (!deleted) {
      throw new ORPCError("NOT_FOUND", {
        message: "Question was not found.",
      });
    }
    revalidateQuestionTags();
    return { ok: true };
  });

const restore = adminProcedure
  .input(questionIdInputSchema)
  .output(okOutput)
  .handler(async ({ context, input }) => {
    const restored = await restoreQuestion(input.id, context.db);
    if (!restored) {
      throw new ORPCError("NOT_FOUND", {
        message: "Deleted question was not found.",
      });
    }
    revalidateQuestionTags();
    return { ok: true };
  });

const reorder = adminProcedure
  .input(reorderQuestionsInputSchema)
  .output(okOutput)
  .handler(async ({ context, input }) => {
    try {
      await reorderQuestions(input.ids, context.db);
      revalidateQuestionTags();
      return { ok: true };
    } catch (error) {
      if (error instanceof OrderedEntitySetMismatchError) {
        throw new ORPCError("BAD_REQUEST", { message: error.message });
      }
      throw error;
    }
  });

export const questionsRouter = {
  admin: {
    create,
    list: listAdmin,
    reorder,
    restore,
    setActive,
    softDelete,
    update,
  },
  listActive,
};
