import "server-only";

import { publicProcedure } from "../middleware";
import { categoriesRouter } from "./categories";
import { inquiriesRouter } from "./inquiries";
import { questionsRouter } from "./questions";

/** Liveness probe verifying the rpc wiring end-to-end. */
const ping = publicProcedure.handler(() => ({ ok: true }) as const);

export const appRouter = {
  health: { ping },
  questions: questionsRouter,
  categories: categoriesRouter,
  inquiries: inquiriesRouter,
};

export type AppRouter = typeof appRouter;
