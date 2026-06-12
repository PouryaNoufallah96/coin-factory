import "server-only";

import { headers } from "next/headers";

import type { AdminSession } from "./auth";
import { auth } from "./auth";

export async function getAdminSessionFromHeaders(
  requestHeaders: Headers | null
): Promise<AdminSession | null> {
  if (!requestHeaders) {
    return null;
  }

  return await auth.api.getSession({ headers: requestHeaders });
}

export async function getCurrentAdminSession() {
  return getAdminSessionFromHeaders(await headers());
}
