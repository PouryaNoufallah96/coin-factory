import { defineConfig } from "drizzle-kit";

// Runs under drizzle-kit (outside Next) — raw process.env is the documented
// exception to the src/config/env rule. Fallback matches docker-compose.yml.
export default defineConfig({
  dialect: "postgresql",
  // The barrel only: globbing the dir would load each table file AND its
  // re-export, registering every table twice.
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://coinfactory:coinfactory@localhost:5432/coinfactory",
  },
});
