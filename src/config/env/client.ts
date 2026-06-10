import { createEnv } from "@t3-oss/env-nextjs";

// No NEXT_PUBLIC_* vars yet. This module is the ONLY place they may be
// declared — add the zod field here AND the key to .env.example.
export const env = createEnv({
  client: {},
  experimental__runtimeEnv: {},
});
