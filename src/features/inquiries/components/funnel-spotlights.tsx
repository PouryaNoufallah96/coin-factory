"use client";

import { useFunnelDraft, type FunnelView } from "@/features/inquiries/hooks/use-funnel-draft";
import { FunnelSpotlight } from "./funnel-spotlight";

type FunnelSpotlightVariant = "landing" | "thank-you" | "wizard";

function resolveSpotlightVariant(view: FunnelView): FunnelSpotlightVariant {
  if (view === "onboarding") {
    return "wizard";
  }

  if (view === "thank-you") {
    return "thank-you";
  }

  return "landing";
}

const LAYER_TRANSITION =
  "absolute inset-0 transition-opacity duration-500 ease-[cubic-bezier(0.2,0,0,1)] pointer-events-none";

export function FunnelSpotlights() {
  const { view } = useFunnelDraft();
  const variant = resolveSpotlightVariant(view);

  return (
    <div aria-hidden="true" className="cf-funnel-backdrop">
      {/* Landing background — crossfades out when leaving */}
      <div
        className={LAYER_TRANSITION}
        style={{
          opacity: variant === "landing" ? 1 : 0,
          backgroundImage: "url('/brand/landing-back.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Wizard spotlight — crossfades in on onboarding view */}
      <div
        className={LAYER_TRANSITION}
        style={{ opacity: variant === "wizard" ? 1 : 0 }}
      >
        <FunnelSpotlight className="cf-spotlight--wizard" />
      </div>

      {/* Thank-you spotlights — crossfades in on thank-you view */}
      <div
        className={LAYER_TRANSITION}
        style={{ opacity: variant === "thank-you" ? 1 : 0 }}
      >
        <FunnelSpotlight className="cf-spotlight--thank-you-top" />
        <FunnelSpotlight className="cf-spotlight--thank-you-bottom" />
      </div>
    </div>
  );
}
