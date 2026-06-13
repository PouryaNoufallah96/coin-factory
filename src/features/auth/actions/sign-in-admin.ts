"use server";

import { headers } from "next/headers";

import { createRpcContext } from "@/server/rpc/context";
import { appRouter } from "@/server/rpc/routers";

export const signInAdmin = appRouter.auth.signInAdmin.actionable({
  context: async () => createRpcContext({ headers: await headers() }),
});
