import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/config/env/server";
import { db } from "@/server/db";
import { account, session, user, verification } from "@/server/db/schema";

const authSchema = {
  account,
  session,
  user,
  verification,
};

export const auth = betterAuth({
  appName: "CoinFactory",
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    disableSignUp: true,
    enabled: true,
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  plugins: [nextCookies()],
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_URL],
});

export type AdminSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;
