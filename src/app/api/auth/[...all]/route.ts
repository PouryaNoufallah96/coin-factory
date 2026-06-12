import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/server/auth/auth";
import { ensureSeedAdmin } from "@/server/auth/seed-admin";

const handlers = toNextJsHandler(auth);

function withSeed(handler: (request: Request) => Promise<Response>) {
  return async function handleAuthRequest(request: Request) {
    await ensureSeedAdmin();
    return handler(request);
  };
}

export const GET = withSeed(handlers.GET);
export const POST = withSeed(handlers.POST);
