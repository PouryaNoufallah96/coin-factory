import "server-only";

import { createRouterClient } from "@orpc/server";

import { createRpcContext } from "@/server/rpc/context";
import { appRouter } from "@/server/rpc/routers";

/**
 * Zero-HTTP oRPC client for RSC and server actions — never fetch /rpc from
 * server code (rule server/orpc). Usage: await orpcServer.health.ping().
 */
export const orpcServer = createRouterClient(appRouter, {
  context: () => createRpcContext(),
});
