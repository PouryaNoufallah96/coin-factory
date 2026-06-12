/// <reference types="react/canary" />

import { type ReactNode, ViewTransition } from "react";

export function FunnelRevealFallback({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="none" exit="slide-down">
      {children}
    </ViewTransition>
  );
}
