"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { FunnelSpotlight } from "./funnel-spotlight";

type FunnelSpotlightVariant = "landing" | "thank-you" | "wizard";

const BACKDROP_CLASS_BY_VARIANT = {
  landing: "cf-funnel-backdrop--landing",
  wizard: "cf-funnel-backdrop--wizard",
  "thank-you": "cf-funnel-backdrop--thank-you",
} as const satisfies Record<FunnelSpotlightVariant, string>;

const SPOTLIGHT_CLASS_BY_VARIANT = {
  landing: ["cf-spotlight--landing"],
  wizard: ["cf-spotlight--wizard"],
  "thank-you": [
    "cf-spotlight--thank-you-top",
    "cf-spotlight--thank-you-bottom",
  ],
} as const satisfies Record<FunnelSpotlightVariant, readonly string[]>;

function resolveSpotlightVariant(pathname: string): FunnelSpotlightVariant {
  if (pathname.startsWith("/onboarding")) {
    return "wizard";
  }

  if (pathname === "/thank-you") {
    return "thank-you";
  }

  return "landing";
}

export function FunnelSpotlights() {
  const pathname = usePathname();
  const variant = resolveSpotlightVariant(pathname);

  if (variant === "landing") {
    return (
      <div
        aria-hidden="true"
        className="cf-funnel-backdrop"
        style={{
          backgroundImage: "url('/brand/landing-back.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn("cf-funnel-backdrop", BACKDROP_CLASS_BY_VARIANT[variant])}
    >
      {SPOTLIGHT_CLASS_BY_VARIANT[variant].map((spotlightClass) => (
        <FunnelSpotlight className={spotlightClass} key={spotlightClass} />
      ))}
    </div>
  );
}
