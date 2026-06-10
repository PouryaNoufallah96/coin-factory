import type { NextConfig } from "next";

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
    turbopackFileSystemCacheForDev: true,
    viewTransition: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
    browserToTerminal: true,
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
