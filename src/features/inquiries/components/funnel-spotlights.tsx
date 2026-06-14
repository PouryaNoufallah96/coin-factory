"use client";

import { usePathname } from "next/navigation";

import { FunnelSpotlight } from "./funnel-spotlight";

type FunnelSpotlightVariant = "landing" | "thank-you" | "wizard";

function resolveSpotlightVariant(pathname: string): FunnelSpotlightVariant {
  if (pathname.startsWith("/onboarding")) {
    return "wizard";
  }

  if (pathname === "/thank-you") {
    return "thank-you";
  }

  return "landing";
}

const LAYER_TRANSITION =
  "absolute inset-0 transition-opacity duration-500 ease-[cubic-bezier(0.2,0,0,1)] pointer-events-none";

export function FunnelSpotlights() {
  const pathname = usePathname();
  const variant = resolveSpotlightVariant(pathname);

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

      {/* Wizard spotlight — crossfades in on /onboarding/* */}
      <div
        className={LAYER_TRANSITION}
        style={{ opacity: variant === "wizard" ? 1 : 0 }}
      >
        <FunnelSpotlight className="cf-spotlight--wizard" />
      </div>

      {/* Thank-you spotlights — crossfades in on /thank-you */}
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
