/// <reference types="react/canary" />

"use client";

import dynamic from "next/dynamic";
import { type ReactNode, ViewTransition } from "react";
import { FunnelPageTransition } from "@/features/inquiries/components/funnel-page-transition";
import { LandingPage } from "@/features/inquiries/components/landing-page";
import { useFunnelDraft } from "@/features/inquiries/hooks/use-funnel-draft";

// Reached only after a submit, so keep the thank-you screen and its
// canvas-confetti dependency out of the landing's initial client bundle.
const ThankYouPage = dynamic(() =>
  import("@/features/inquiries/components/thank-you-page").then(
    (mod) => mod.ThankYouPage
  )
);

interface FunnelAppProps {
  categoriesSlot: ReactNode;
  wizardSlot: ReactNode;
}

export function FunnelApp({ categoriesSlot, wizardSlot }: FunnelAppProps) {
  const { view } = useFunnelDraft();

  if (view === "thank-you") {
    return (
      <FunnelPageTransition>
        <ThankYouPage />
      </FunnelPageTransition>
    );
  }

  if (view === "onboarding") {
    return <FunnelPageTransition>{wizardSlot}</FunnelPageTransition>;
  }

  return (
    <FunnelPageTransition>
      <LandingPage>
        <ViewTransition default="none" enter="slide-up">
          {categoriesSlot}
        </ViewTransition>
      </LandingPage>
    </FunnelPageTransition>
  );
}
