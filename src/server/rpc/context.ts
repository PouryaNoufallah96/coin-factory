import "server-only";

import { db } from "@/server/db";

export interface RpcContext {
  db: typeof db;
  /** Null when the call never crossed a request boundary (RSC router client). */
  headers: Headers | null;
  ip: string | null;
}

interface RpcRequestInfo {
  headers: Headers;
}

/**
 * Built per request (route handler, server action) and per server-side
 * router-client call; only request-bound calls carry headers and an IP.
 */
export function createRpcContext(request?: RpcRequestInfo): RpcContext {
  if (!request) {
    return { db, headers: null, ip: null };
  }
  return { db, headers: request.headers, ip: clientIpFrom(request.headers) };
}

/** Self-host target: the reverse proxy sets the forwarding headers (ADR-0006). */
function clientIpFrom(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwardedFor) {
    return forwardedFor;
  }
  return headers.get("x-real-ip");
}
