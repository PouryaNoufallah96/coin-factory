import { connection } from "next/server";

import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingWizard } from "@/features/inquiries/components/onboarding-wizard";
import { getActiveQuestions } from "@/features/questions/api/server/get-active-questions";

const STEPPER_SKELETON_KEYS = [
  "step-1",
  "step-2",
  "step-3",
  "step-4",
  "step-5",
  "step-6",
];

const OPTION_SKELETON_KEYS = ["opt-1", "opt-2", "opt-3", "opt-4"];

export async function FunnelWizard() {
  // Stream at request time so the static funnel shell builds without a DB.
  await connection();
  const questions = await getActiveQuestions();
  return <OnboardingWizard questions={questions} />;
}

export function WizardSkeleton() {
  return (
    <section className="relative flex flex-1 justify-center px-(--cf-page-x) pb-32.5">
      <div className="cf-content-container flex w-full flex-col items-center">
        <div className="flex items-center gap-(--cf-stepper-gap)">
          {STEPPER_SKELETON_KEYS.map((key) => (
            <Skeleton
              className="h-(--cf-stepper-segment-h) w-(--cf-stepper-segment-w) rounded-(--cf-radius-segment)"
              key={key}
            />
          ))}
        </div>
        <Skeleton className="mt-(--cf-wizard-step-question-gap) h-10 w-(--cf-content-w) max-w-full rounded-(--cf-radius-pill)" />
        <div className="mt-(--cf-wizard-question-options-gap) flex w-full flex-col items-center gap-5">
          {OPTION_SKELETON_KEYS.map((key) => (
            <Skeleton
              className="h-(--cf-row-h) w-full max-w-(--cf-field-w) rounded-(--cf-radius-row)"
              key={key}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
