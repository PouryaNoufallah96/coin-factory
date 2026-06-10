import { publicProcedure } from "../middleware";

/** Liveness probe verifying the rpc wiring end-to-end. */
const ping = publicProcedure.handler(() => ({ ok: true }) as const);

export const appRouter = {
  health: { ping },
};

export type AppRouter = typeof appRouter;
