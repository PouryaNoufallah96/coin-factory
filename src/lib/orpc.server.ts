import "server-only";

import { createRouterClient } from "@orpc/server";
import { headers } from "next/headers";

import { createRpcContext } from "@/server/rpc/context";
import { appRouter } from "@/server/rpc/routers";

/**
 * Zero-HTTP oRPC client for RSC and server actions — never fetch /rpc from
 * server code (rule server/orpc). Usage: await orpcServer.health.ping().
 */
export const orpcServer = createRouterClient(appRouter, {
  context: () => createRpcContext(),
});

/**
 * Request-bound oRPC client for authenticated RSC reads. Admin procedures need
 * current request headers so Better Auth can validate the session; still no
 * server-side HTTP hop.
 */
export async function createRequestOrpcServer() {
  const requestHeaders = await headers();

  return createRouterClient(appRouter, {
    context: () => createRpcContext({ headers: requestHeaders }),
  });
}
