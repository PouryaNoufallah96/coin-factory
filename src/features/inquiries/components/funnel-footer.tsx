"use client";

import { usePathname } from "next/navigation";
import { MaskIcon } from "@/components/common/mask-icon";
import { useFunnelDraft } from "@/features/inquiries/hooks/use-funnel-draft";

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
  const pathname = usePathname();
  const showFooter =
    pathname === "/services" || pathname === "/about" || view === "landing";

  if (!showFooter) {
    return null;
  }

  return <FunnelFooterContent />;
}

export function FunnelFooterContent() {
  return (
    <footer
      className="sticky bottom-0 z-20 mt-auto flex h-(--cf-footer-h) shrink-0 items-center justify-between gap-6 px-(--cf-page-x)"
      data-funnel-resume-hide
    >
      <nav
        aria-label="CoinFactory social links"
        className="flex items-center gap-(--cf-social-gap)"
      >
        {SOCIAL_LINKS.map((link) => (
          <a
            aria-label={link.label}
            className="flex size-(--cf-social-size) shrink-0 items-center justify-center rounded-full border border-cf-cream/40 text-cf-cream transition-all duration-(--cf-dur-feedback) ease-(--cf-ease) hover:scale-110 hover:border-cf-cream hover:bg-cf-cream hover:text-cf-charcoal-900 active:scale-95"
            href={link.href}
            key={link.platform}
          >
            <MaskIcon
              className={"size-(--cf-social-mark-size)"}
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
