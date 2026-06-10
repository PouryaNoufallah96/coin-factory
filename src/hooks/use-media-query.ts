"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string) {
  return (onStoreChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onStoreChange);
    return () => mql.removeEventListener("change", onStoreChange);
  };
}

/**
 * SSR-safe media-query hook. Returns false on the server and during
 * hydration, then the real match. Use for behavior switches (e.g. dialog vs
 * drawer) — prefer CSS for purely visual responsiveness.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => false
  );
}

export const DESKTOP_QUERY = "(min-width: 768px)";

export function useIsDesktop() {
  return useMediaQuery(DESKTOP_QUERY);
}
