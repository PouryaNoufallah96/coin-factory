"use client";

import dynamic from "next/dynamic";
import { ViewTransition } from "react";
import type { PublicCategory } from "@/features/categories/schemas/category";
import { FunnelPageTransition } from "@/features/inquiries/components/funnel-page-transition";
import {
  LandingCategoryChips,
  LandingPage,
} from "@/features/inquiries/components/landing-page";
import { OnboardingWizard } from "@/features/inquiries/components/onboarding-wizard";
import { useFunnelDraft } from "@/features/inquiries/hooks/use-funnel-draft";
import type { PublicQuestion } from "@/features/questions/schemas/question";

// Reached only after a submit, so keep the thank-you screen and its
// canvas-confetti dependency out of the landing's initial client bundle.
const ThankYouPage = dynamic(() =>
  import("@/features/inquiries/components/thank-you-page").then(
    (mod) => mod.ThankYouPage
  )
);

interface FunnelAppProps {
  categories: PublicCategory[];
  questions: PublicQuestion[];
}

export function FunnelApp({ categories, questions }: FunnelAppProps) {
  const { view, step } = useFunnelDraft();

  if (view === "thank-you") {
    return (
      <FunnelPageTransition>
        <ThankYouPage />
      </FunnelPageTransition>
    );
  }

  // Clamp the persisted step: questions disabled/removed since the draft was
  // saved can leave it out of range, which would render an undefined question.
  if (view === "onboarding" && questions.length > 0) {
    const safeStep = Math.min(Math.max(step, 1), questions.length);
    return (
      <FunnelPageTransition>
        <OnboardingWizard questions={questions} step={safeStep} />
      </FunnelPageTransition>
    );
  }

  return (
    <FunnelPageTransition>
      <LandingPage categories={categories}>
        <ViewTransition default="none" enter="slide-up">
          <LandingCategoryChips categories={categories} />
        </ViewTransition>
      </LandingPage>
    </FunnelPageTransition>
  );
}
