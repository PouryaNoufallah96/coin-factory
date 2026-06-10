import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import { cache } from "react";

const DEFAULT_STALE_TIME_MS = 30_000;

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Above zero so hydrated prefetches aren't refetched on mount.
        staleTime: DEFAULT_STALE_TIME_MS,
      },
      dehydrate: {
        // Include pending queries so RSC prefetches stream to the client.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

// React cache() gives each server request its own client (no cross-request
// leakage); the browser keeps one client for the whole session.
const getServerQueryClient = cache(makeQueryClient);

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return getServerQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
