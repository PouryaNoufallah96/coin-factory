import { defineConfig } from "drizzle-kit";

// Runs under drizzle-kit (outside Next) — raw process.env is the documented
// exception to the src/config/env rule. Fallback matches docker-compose.yml.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://coinfactory:coinfactory@localhost:5432/coinfactory",
  },
});
