"use server";

import { headers } from "next/headers";

import { createRpcContext } from "@/server/rpc/context";
import { appRouter } from "@/server/rpc/routers";

/**
 * The wizard's submit path — the same procedure the /rpc transport exposes,
 * with the request headers carried into the context so the per-IP throttle
 * covers both paths.
 */
export const createInquiry = appRouter.inquiries.create.actionable({
  context: async () => createRpcContext({ headers: await headers() }),
});
