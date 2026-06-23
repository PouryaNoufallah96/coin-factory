"use client";

import Link from "next/link";

import { MaskIcon } from "@/components/common/mask-icon";
import { useFunnelHome } from "../hooks/use-funnel-home";

export function FunnelLogo() {
  const goHome = useFunnelHome();

  return (
    <Link
      aria-label="CoinFactory home"
      className="flex items-center gap-1 text-cf-cream transition-opacity duration-(--cf-dur-feedback) ease-(--cf-ease) hover:opacity-70 active:opacity-50"
      href="/"
      onClick={goHome}
    >
      <MaskIcon
        className="h-(--cf-logo-mark-h) w-(--cf-logo-mark-w)"
        src="/brand/logo-c.svg"
      />
      <span className="text-(length:--cf-text-logo) font-logo leading-none">
        oinfactory
      </span>
    </Link>
  );
}
