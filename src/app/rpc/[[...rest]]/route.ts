import { RPCHandler } from "@orpc/server/fetch";

import { createRpcContext } from "@/server/rpc/context";
import { appRouter } from "@/server/rpc/routers";

// Mount-only file — no business logic here (rule server/orpc).
const handler = new RPCHandler(appRouter);

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/rpc",
    context: createRpcContext(),
  });
  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
