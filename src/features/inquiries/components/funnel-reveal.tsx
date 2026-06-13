/// <reference types="react/canary" />

import { type ReactNode, ViewTransition } from "react";

export function FunnelReveal({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="none" enter="slide-up">
      {children}
    </ViewTransition>
  );
}
