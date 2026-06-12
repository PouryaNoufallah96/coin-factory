import type { NextConfig } from "next";

// @ts-expect-error TS5097: the explicit .ts extension is required — Node
// imports .mts config natively (type stripping, no extension probing), and
// allowImportingTsExtensions stays off for the app's own module graph.
import { MAX_REQUEST_BODY_BYTES } from "./src/features/inquiries/schemas/file-constraints.ts";

// Config runs outside the app's module graph: the "@/" alias does not
// resolve (hence the relative import) and reading process.env directly is
// the sanctioned exception to the t3-env rule.
const serverActionOrigins = new Set(["localhost:3000"]);
if (process.env.BETTER_AUTH_URL) {
  serverActionOrigins.add(new URL(process.env.BETTER_AUTH_URL).host);
}

const nextConfig: NextConfig = {
  output: "standalone",
  typedRoutes: true,
  reactCompiler: true,
  cacheComponents: true,
  // Pin the workspace root — a stray lockfile in $HOME otherwise makes
  // Next infer the wrong root and warn on every build.
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    authInterrupts: true,
    globalNotFound: true,
    serverActions: {
      bodySizeLimit: MAX_REQUEST_BODY_BYTES,
      allowedOrigins: [...serverActionOrigins],
    },
    turbopackFileSystemCacheForDev: true,
    viewTransition: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
    browserToTerminal: true,
    serverFunctions: false,
  },
  // compiler: {
  //   // Strip ALL console calls in production — no exclusions. Source code must
  //   // not rely on console (Biome forbids it); errors surface via typed
  //   // ORPCError + error boundaries.
  //   removeConsole: true,
  // },
  images: {
    qualities: [25, 50, 75, 95, 100],
  },
};

export default nextConfig;
