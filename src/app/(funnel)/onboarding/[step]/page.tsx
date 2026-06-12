import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { FunnelPageTransition } from "@/features/inquiries/components/funnel-page-transition";
import { FunnelReveal } from "@/features/inquiries/components/funnel-reveal";
import { FunnelRevealFallback } from "@/features/inquiries/components/funnel-reveal-fallback";
import { OnboardingWizard } from "@/features/inquiries/components/onboarding-wizard";
import { getActiveQuestions } from "@/features/questions/api/server/get-active-questions";

const FALLBACK_STEP_KEYS = [
  "fallback-step-one",
  "fallback-step-two",
  "fallback-step-three",
  "fallback-step-four",
  "fallback-step-five",
  "fallback-step-six",
];

const FALLBACK_OPTION_KEYS = [
  "fallback-option-one",
  "fallback-option-two",
  "fallback-option-three",
  "fallback-option-four",
];

export const metadata: Metadata = {
  title: "Onboarding",
};

export default function OnboardingStepPage(
  props: PageProps<"/onboarding/[step]">
) {
  return (
    <FunnelPageTransition>
      <Suspense
        fallback={
          <FunnelRevealFallback>
            <OnboardingFallback />
          </FunnelRevealFallback>
        }
      >
        <FunnelReveal>
          <OnboardingStep params={props.params} />
        </FunnelReveal>
      </Suspense>
    </FunnelPageTransition>
  );
}

async function OnboardingStep({
  params,
}: {
  params: PageProps<"/onboarding/[step]">["params"];
}) {
  const [{ step: stepParam }, questions] = await Promise.all([
    params,
    getActiveQuestions(),
  ]);
  const step = Number(stepParam);

  if (!Number.isInteger(step) || step < 1 || step > questions.length) {
    notFound();
  }

  return <OnboardingWizard questions={questions} step={step} />;
}

function OnboardingFallback() {
  return (
    <section className="flex flex-1 items-center justify-center px-6 py-6 sm:px-10 lg:px-(--cf-page-x)">
      <div className="cf-content-container flex flex-col items-center gap-10 text-center sm:gap-12">
        <div className="flex items-center gap-(--cf-stepper-gap)">
          {FALLBACK_STEP_KEYS.map((key) => (
            <Skeleton
              className="h-(--cf-stepper-segment-h) w-(--cf-stepper-segment-w) rounded-(--cf-radius-segment) bg-cf-cream/20"
              key={key}
            />
          ))}
        </div>
        <Skeleton className="h-10 w-full max-w-xl rounded-full bg-cf-chip-bg" />
        <div className="cf-field-container flex flex-col gap-5">
          {FALLBACK_OPTION_KEYS.map((key) => (
            <Skeleton
              className="h-(--cf-row-h) rounded-(--cf-radius-row) bg-cf-surface-muted"
              key={key}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
