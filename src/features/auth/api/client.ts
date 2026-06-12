"use client";

import { createAuthClient } from "better-auth/react";

import { env } from "@/config/env/client";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_AUTH_URL,
});
