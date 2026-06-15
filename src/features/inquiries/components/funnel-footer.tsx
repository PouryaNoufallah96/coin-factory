"use client";

import { MaskIcon } from "@/components/common/mask-icon";
import { useFunnelDraft } from "@/features/inquiries/hooks/use-funnel-draft";
import { cn } from "@/lib/utils";

const SOCIAL_LINKS = [
  { href: "#", label: "X", platform: "x" },
  { href: "#", label: "Instagram", platform: "instagram" },
  { href: "#", label: "WhatsApp", platform: "whatsapp" },
  { href: "#", label: "Telegram", platform: "telegram" },
  { href: "#", label: "YouTube", platform: "youtube" },
  { href: "#", label: "Discord", platform: "discord" },
];

export function FunnelFooter() {
  const { view } = useFunnelDraft();

  if (view !== "landing") {
    return null;
  }

  return (
    <footer className="relative z-20 mt-auto flex h-(--cf-footer-h) shrink-0 items-center justify-between gap-6 px-(--cf-page-x)">
      <nav
        aria-label="CoinFactory social links"
        className="flex items-center gap-(--cf-social-gap)"
      >
        {SOCIAL_LINKS.map((link) => (
          <a
            aria-label={link.label}
            className={cn(
              "flex size-(--cf-social-size) shrink-0 items-center justify-center rounded-full opacity-100 transition-opacity duration-(--cf-dur-feedback) ease-(--cf-ease) hover:opacity-70",
              link.platform === "x"
                ? "bg-cf-cream text-cf-text-on-accent"
                : "border border-cf-cream/40 text-cf-cream"
            )}
            href={link.href}
            key={link.platform}
          >
            <MaskIcon
              className={cn(
                link.platform === "x"
                  ? "h-(--cf-social-x-mark-h) w-(--cf-social-x-mark-w)"
                  : "size-(--cf-social-mark-size)"
              )}
              src={`/brand/social-${link.platform}.svg`}
            />
          </a>
        ))}
      </nav>
      <span className="text-(length:--cf-text-base) whitespace-nowrap font-legal text-cf-charcoal-900">
        @ 2026 CoinFactory AG
      </span>
    </footer>
  );
}
