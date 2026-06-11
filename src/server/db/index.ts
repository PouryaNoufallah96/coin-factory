import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/config/env/server";
import { relations } from "./relations";

// Dev HMR re-imports this module; caching the pool on globalThis keeps
// reloads from leaking connections until Postgres refuses them (gotcha 7).
type DbGlobal = typeof globalThis & { __coinFactoryPool?: Pool };
const dbGlobal: DbGlobal = globalThis;

const pool =
  dbGlobal.__coinFactoryPool ??
  new Pool({ connectionString: env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  dbGlobal.__coinFactoryPool = pool;
}

export const db = drizzle({ client: pool, relations, casing: "snake_case" });

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Write helpers take an executor defaulting to `db`; multi-table flows pass
 * the `tx` from one `db.transaction` so every statement shares it.
 */
export type DbExecutor = typeof db | DbTransaction;
