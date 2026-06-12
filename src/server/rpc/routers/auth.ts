import "server-only";

import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { adminLoginActionSchema } from "@/features/auth/schemas/admin-login";
import { adminRedirectPath } from "@/lib/admin-redirect";
import { auth } from "@/server/auth/auth";
import { ensureSeedAdmin } from "@/server/auth/seed-admin";

import { publicProcedure, withIpThrottle } from "../middleware";

const SIGN_IN_LIMIT_PER_MINUTE = 8;
const SIGN_IN_WINDOW_MS = 60_000;
const INVALID_CREDENTIALS_MESSAGE = "The email or password is incorrect.";

const signInAdmin = publicProcedure
  .use(
    withIpThrottle("admin-sign-in", SIGN_IN_LIMIT_PER_MINUTE, SIGN_IN_WINDOW_MS)
  )
  .input(adminLoginActionSchema)
  .output(z.object({ redirectTo: z.string() }))
  .handler(async ({ input }) => {
    const redirectTo = adminRedirectPath(input.redirectTo);

    try {
      await ensureSeedAdmin();
      await auth.api.signInEmail({
        body: {
          callbackURL: redirectTo,
          email: input.email,
          password: input.password,
        },
      });
    } catch {
      throw new ORPCError("UNAUTHORIZED", {
        message: INVALID_CREDENTIALS_MESSAGE,
      });
    }

    return { redirectTo };
  });

export const authRouter = { signInAdmin };
