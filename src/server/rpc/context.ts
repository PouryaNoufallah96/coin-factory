import { db } from "@/server/db";

export interface RpcContext {
  db: typeof db;
}

/** Built per request (route handler) and per server-side router-client call. */
export function createRpcContext(): RpcContext {
  return { db };
}
