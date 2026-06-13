import "server-only";

import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";

import { env } from "@/config/env/server";
import { db } from "@/server/db";
import { account, user } from "@/server/db/schema";

const ADMIN_NAME = "CoinFactory Admin";

let seedPromise: Promise<void> | null = null;

export function ensureSeedAdmin() {
  seedPromise ??= seedAdmin().catch((error) => {
    seedPromise = null;
    throw error;
  });

  return seedPromise;
}

async function seedAdmin() {
  const now = new Date();
  const email = env.ADMIN_EMAIL.trim().toLowerCase();
  const password = await hashPassword(env.ADMIN_PASSWORD);

  await db.transaction(async (tx) => {
    await tx
      .insert(user)
      .values({
        id: crypto.randomUUID(),
        createdAt: now,
        email,
        emailVerified: true,
        image: null,
        name: ADMIN_NAME,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: user.email,
        set: {
          emailVerified: true,
          name: ADMIN_NAME,
          updatedAt: now,
        },
      });

    const [admin] = await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!admin) {
      throw new Error("Seed admin was not created.");
    }

    await tx
      .insert(account)
      .values({
        id: crypto.randomUUID(),
        accountId: admin.id,
        createdAt: now,
        password,
        providerId: "credential",
        updatedAt: now,
        userId: admin.id,
      })
      .onConflictDoUpdate({
        target: [account.providerId, account.accountId],
        set: {
          password,
          updatedAt: now,
          userId: admin.id,
        },
      });
  });
}
