"use client";

import { usePathname } from "next/navigation";
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
  landing: "var(--cf-landing-bg)",
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
  const pathname = usePathname();
  const active = pathname === "/" ? resolveVariant(view) : null;

  return (
    <div aria-hidden="true" className="cf-funnel-backdrop">
      {VARIANTS.map((variant) => (
        <div
          className={LAYER}
          data-funnel-resume-hide={variant === "landing" ? "" : undefined}
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
