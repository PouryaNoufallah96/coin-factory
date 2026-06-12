import "server-only";

import { ORPCError, os } from "@orpc/server";

import { MAX_REQUEST_BODY_BYTES } from "@/features/inquiries/schemas/file-constraints";
import { getAdminSessionFromHeaders } from "@/server/auth/session";

import type { RpcContext } from "./context";
import { consumeRateLimit } from "./rate-limit";

const base = os.$context<RpcContext>();

/** Unauthenticated builder — the public funnel runs entirely on this. */
export const publicProcedure = base;

const requireAdminSession = base.middleware(async ({ context, next }) => {
  const adminSession = await getAdminSessionFromHeaders(context.headers);

  if (!adminSession) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Admin sign-in required.",
    });
  }

  return next({ context: { adminSession } });
});

export const adminProcedure = publicProcedure.use(requireAdminSession);

/**
 * Post-parse per-IP throttle (docs/SECURITY.md). Internal calls — the RSC
 * router client builds its context without a request — bypass it; requests
 * arriving without forwarding headers share one bucket instead of escaping
 * the cap.
 */
export function withIpThrottle(scope: string, limit: number, windowMs: number) {
  return base.middleware(({ context, next }) => {
    if (!context.headers) {
      return next();
    }
    const key = `${scope}:${context.ip ?? "unknown"}`;
    if (!consumeRateLimit(key, limit, windowMs)) {
      throw new ORPCError("TOO_MANY_REQUESTS", {
        message: "Too many requests. Please try again in a minute.",
      });
    }
    return next();
  });
}

/**
 * Post-parse payload quota: the transport caps (Content-Length rejection,
 * BodyLimitPlugin, serverActions.bodySizeLimit) bound the raw body, and this
 * bounds what they decoded — every layer reads the same byte budget.
 */
export const payloadQuota = base.middleware(({ next }, input: unknown) => {
  if (estimatePayloadBytes(input) > MAX_REQUEST_BODY_BYTES) {
    throw new ORPCError("PAYLOAD_TOO_LARGE", {
      message: "The submission is too large.",
    });
  }
  return next();
});

// Floor for primitives so adversarial payloads of many tiny values still
// count against the budget.
const PRIMITIVE_FLOOR_BYTES = 8;

function estimatePayloadBytes(value: unknown): number {
  if (value instanceof Blob) {
    return value.size;
  }
  if (typeof value === "string") {
    return value.length;
  }
  if (Array.isArray(value)) {
    return value.reduce(
      (sum: number, item) => sum + estimatePayloadBytes(item),
      0
    );
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce(
      (sum, [key, item]) => sum + key.length + estimatePayloadBytes(item),
      0
    );
  }
  return PRIMITIVE_FLOOR_BYTES;
}
