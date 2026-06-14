/// <reference types="react/canary" />

"use client";

import { ViewTransition } from "react";

import { FunnelPageTransition } from "@/features/inquiries/components/funnel-page-transition";
import { LandingCategoryChips, LandingPage } from "@/features/inquiries/components/landing-page";
import { OnboardingWizard } from "@/features/inquiries/components/onboarding-wizard";
import { ThankYouPage } from "@/features/inquiries/components/thank-you-page";
import type { PublicCategory } from "@/features/categories/schemas/category";
import type { PublicQuestion } from "@/features/questions/schemas/question";
import { useFunnelDraft } from "@/features/inquiries/hooks/use-funnel-draft";

interface FunnelAppProps {
  categories: PublicCategory[];
  questions: PublicQuestion[];
}

export function FunnelApp({ categories, questions }: FunnelAppProps) {
  const { view, step, isHydrated } = useFunnelDraft();

  if (!isHydrated) return null;

  if (view === "thank-you") {
    return (
      <FunnelPageTransition>
        <ThankYouPage />
      </FunnelPageTransition>
    );
  }

  if (view === "onboarding") {
    return (
      <FunnelPageTransition>
        <OnboardingWizard questions={questions} step={step} />
      </FunnelPageTransition>
    );
  }

  return (
    <FunnelPageTransition>
      <LandingPage>
        <ViewTransition default="none" enter="slide-up">
          <LandingCategoryChips categories={categories} />
        </ViewTransition>
      </LandingPage>
    </FunnelPageTransition>
  );
}
