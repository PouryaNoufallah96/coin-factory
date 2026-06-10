import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import type { AppRouter } from "@/server/rpc/routers";

const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined") {
      // Server code never self-fetches /rpc — use orpcServer (lib/orpc.server.ts).
      throw new Error("RPCLink is browser-only; use orpcServer on the server.");
    }
    return `${window.location.origin}/rpc`;
  },
});

export const client: RouterClient<AppRouter> = createORPCClient(link);

/** TanStack Query utils: orpc.health.ping.queryOptions(), .key(), … */
export const orpc = createTanstackQueryUtils(client);
