"use client";

import {
  type FunnelView,
  useFunnelDraft,
} from "@/features/inquiries/hooks/use-funnel-draft";

type FunnelSpotlightVariant = "landing" | "onboarding" | "thank-you";

function resolveVariant(view: FunnelView): FunnelSpotlightVariant {
  if (view === "onboarding") {
    return "onboarding";
  }
  if (view === "thank-you") {
    return "thank-you";
  }
  return "landing";
}

const BACKGROUNDS: Record<FunnelSpotlightVariant, string> = {
  landing: "url('/brand/landing-back.svg')",
  onboarding: "url('/brand/q-back.svg')",
  "thank-you": "url('/brand/thankyou-back.svg')",
};

const LAYER =
  "absolute inset-0 transition-opacity duration-900 ease-[cubic-bezier(0.2,0,0,1)] pointer-events-none bg-cover bg-center bg-no-repeat";

const VARIANTS: FunnelSpotlightVariant[] = [
  "landing",
  "onboarding",
  "thank-you",
];

export function FunnelSpotlights() {
  const { view } = useFunnelDraft();
  const active = resolveVariant(view);

  return (
    <div aria-hidden="true" className="cf-funnel-backdrop">
      {VARIANTS.map((variant) => (
        <div
          className={LAYER}
          key={variant}
          style={{
            opacity: active === variant ? 1 : 0,
            backgroundImage: BACKGROUNDS[variant],
          }}
        />
      ))}
    </div>
  );
}
