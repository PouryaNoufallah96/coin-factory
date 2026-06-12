/// <reference types="react/canary" />

import { type ReactNode, ViewTransition } from "react";

const NAV_TRANSITION = {
  "nav-back": "nav-back",
  "nav-forward": "nav-forward",
  default: "none",
} as const;

export function FunnelPageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="none" enter={NAV_TRANSITION} exit={NAV_TRANSITION}>
      {children}
    </ViewTransition>
  );
}
