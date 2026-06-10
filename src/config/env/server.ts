import "server-only";

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Default mirrors docker-compose.yml (committed local dev credentials,
    // same fallback as drizzle.config.ts); production deploys override it.
    DATABASE_URL: z
      .url()
      .default(
        "postgresql://coinfactory:coinfactory@localhost:5432/coinfactory"
      ),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
});
