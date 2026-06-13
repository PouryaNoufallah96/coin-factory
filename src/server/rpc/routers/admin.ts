import "server-only";

import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { adminProcedure } from "../middleware";

const session = adminProcedure
  .output(
    z.object({
      user: z.object({
        email: z.email(),
        id: z.uuid(),
        name: z.string(),
      }),
    })
  )
  .handler(({ context }) => {
    if (!context.adminSession) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Admin sign-in required.",
      });
    }

    return {
      user: {
        email: context.adminSession.user.email,
        id: context.adminSession.user.id,
        name: context.adminSession.user.name,
      },
    };
  });

export const adminRouter = { session };
