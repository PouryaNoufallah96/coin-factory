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
    STORAGE_DRIVER: z.enum(["minio", "blob"]),
    // Required when STORAGE_DRIVER=minio. Optional here so the Vercel
    // preview (blob driver) can omit them; the storage factory asserts
    // presence for the selected driver.
    S3_ENDPOINT: z.url().optional(),
    S3_REGION: z.string().min(1).optional(),
    S3_ACCESS_KEY_ID: z.string().min(1).optional(),
    S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    S3_BUCKET: z.string().min(1).optional(),
    // Required when STORAGE_DRIVER=blob, asserted by the storage factory.
    BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().min(1),
    SUBMISSION_NOTIFICATION_EMAIL: z.email(),
    SUBMISSION_FROM_EMAIL: z.email(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    ADMIN_EMAIL: z.email(),
    ADMIN_PASSWORD: z.string().min(8),
    SENTRY_DSN: z.url().optional(),
    SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
    SENTRY_ORG: z.string().min(1).optional(),
    SENTRY_PROJECT: z.string().min(1).optional(),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
});
