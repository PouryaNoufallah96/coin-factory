import "server-only";

import { listActiveQuestions } from "@/features/questions/db/queries";
import { publicQuestionSchema } from "@/features/questions/schemas/question";

import { publicProcedure, withIpThrottle } from "../middleware";

// Reads are cheap and cached for RSC consumers; the throttle only meters
// direct /rpc traffic.
const READ_LIMIT_PER_MINUTE = 60;
const READ_WINDOW_MS = 60_000;

const listActive = publicProcedure
  .use(withIpThrottle("questions-read", READ_LIMIT_PER_MINUTE, READ_WINDOW_MS))
  .output(publicQuestionSchema.array())
  .handler(({ context }) => listActiveQuestions(context.db));

export const questionsRouter = { listActive };
