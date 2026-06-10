import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/config/env/server";
// biome-ignore lint/performance/noNamespaceImport: drizzle consumes the schema barrel wholesale (server-only, no tree-shaking concern)
import * as schema from "./schema";

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

export const db = drizzle({ client: pool, schema, casing: "snake_case" });
