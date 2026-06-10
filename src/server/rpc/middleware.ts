import { os } from "@orpc/server";

import type { RpcContext } from "./context";

const base = os.$context<RpcContext>();

/** Unauthenticated builder — the public funnel runs entirely on this. */
export const publicProcedure = base;

// authedProcedure (better-auth session middleware) arrives with the admin
// phase — do not implement auth before then.
