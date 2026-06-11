import { BodyLimitPlugin, RPCHandler } from "@orpc/server/fetch";

import { MAX_REQUEST_BODY_BYTES } from "@/features/inquiries/schemas/file-constraints";
import { createRpcContext } from "@/server/rpc/context";
import { appRouter } from "@/server/rpc/routers";

// Mount-only file — no business logic here (rule server/orpc). The plugin
// reads the ONE shared byte budget and re-checks streamed bytes for senders
// that lie about or omit Content-Length.
const handler = new RPCHandler(appRouter, {
  plugins: [new BodyLimitPlugin({ maxBodySize: MAX_REQUEST_BODY_BYTES })],
});

async function handleRequest(request: Request) {
  // Pre-parse cap: refuse oversized bodies before consuming a single byte.
  if (declaredBodyBytes(request) > MAX_REQUEST_BODY_BYTES) {
    return new Response("Payload too large", { status: 413 });
  }
  const { response } = await handler.handle(toNativeRequest(request), {
    prefix: "/rpc",
    context: createRpcContext({ headers: request.headers }),
  });
  return response ?? new Response("Not found", { status: 404 });
}

/**
 * Next hands route handlers its own Request subclass; BodyLimitPlugin
 * re-wraps the body with `new Request(...)`, which throws on a foreign
 * class's private state. Rebuild the request in this realm first.
 */
function toNativeRequest(request: Request): Request {
  if (!request.body) {
    return new Request(request.url, {
      method: request.method,
      headers: request.headers,
    });
  }
  const init: RequestInit & { duplex: "half" } = {
    method: request.method,
    headers: request.headers,
    body: request.body,
    duplex: "half",
  };
  return new Request(request.url, init);
}

function declaredBodyBytes(request: Request): number {
  const declared = Number.parseInt(
    request.headers.get("content-length") ?? "",
    10
  );
  return Number.isNaN(declared) ? 0 : declared;
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
