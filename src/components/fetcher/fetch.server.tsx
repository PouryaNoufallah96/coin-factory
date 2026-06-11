import "server-only";

import type { ReactNode } from "react";

interface ServerFetchResultProps<T> {
  children: (data: T) => ReactNode;
  /** Pending promise or thunk — e.g. an orpcServer router-client call. */
  data: Promise<T> | (() => Promise<T>);
  /** Rendered when the call resolves to null/undefined. */
  empty?: ReactNode;
}

/**
 * Awaits a server-side read inside the RSC tree: suspends while pending,
 * throws to the nearest error boundary on failure, renders children(data).
 * Wrap call sites in <Suspense> + ComponentErrorBoundary.
 */
export async function ServerFetchResult<T>({
  data,
  children,
  empty = null,
}: ServerFetchResultProps<T>) {
  const resolved = typeof data === "function" ? await data() : await data;

  if (resolved === null || resolved === undefined) {
    return empty;
  }

  return children(resolved);
}
