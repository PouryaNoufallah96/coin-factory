"use client";

import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { useFunnelDraft } from "./use-funnel-draft";

export function useFunnelHome() {
  const { view, goTo, reset } = useFunnelDraft();
  const pathname = usePathname();

  return function goHome(event: MouseEvent<HTMLAnchorElement>) {
    const resetView = () => {
      if (view === "thank-you") {
        reset();
        return;
      }
      goTo("landing", 1, "nav-back");
    };

    if (pathname === "/") {
      if (view === "landing") {
        return;
      }
      event.preventDefault();
      resetView();
      return;
    }

    resetView();
  };
}
