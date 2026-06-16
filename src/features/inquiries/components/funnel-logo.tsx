import Link from "next/link";

import { MaskIcon } from "@/components/common/mask-icon";

export function FunnelLogo() {
  return (
    <Link
      aria-label="CoinFactory home"
      className="flex items-center gap-1 text-cf-cream transition-opacity duration-(--cf-dur-feedback) ease-(--cf-ease) hover:opacity-70 active:opacity-50"
      href="/"
    >
      <MaskIcon
        className="h-(--cf-logo-mark-h) w-(--cf-logo-mark-w)"
        src="/brand/logo-c.svg"
      />
      <span className="text-(length:--cf-text-logo) font-logo leading-none">
        coinfactory
      </span>
    </Link>
  );
}
