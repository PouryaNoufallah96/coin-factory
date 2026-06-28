"use client";

import { usePathname } from "next/navigation";
import { MaskIcon } from "@/components/common/mask-icon";
import { useFunnelDraft } from "@/features/inquiries/hooks/use-funnel-draft";
import { useIsPageScrollable } from "@/hooks/use-is-page-scrollable";
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
  const pathname = usePathname();
  const { view } = useFunnelDraft();
  const showFooter =
    (pathname === "/" || pathname === "/services" || pathname === "/about") &&
    view !== "onboarding";
  const isLandingFirstPage = pathname === "/" && view !== "onboarding";
  const isPageScrollable = useIsPageScrollable();

  if (!showFooter) {
    return null;
  }

  return (
    <FunnelFooterContent showBlur={!isLandingFirstPage || isPageScrollable} />
  );
}

export function FunnelSocialNav({ className }: { className?: string }) {
  return (
    <nav
      aria-label="CoinFactory social links"
      className={cn(
        "grid grid-cols-3 items-center gap-(--cf-social-gap) sm:flex",
        className
      )}
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
  );
}

export function FunnelFooterContent({
  showBlur = true,
}: {
  showBlur?: boolean;
}) {
  return (
    <footer
      className="fixed right-0 bottom-0 left-0 z-20 hidden h-(--cf-footer-h) shrink-0 items-center justify-between gap-6 px-(--cf-page-x) sm:flex"
      data-funnel-resume-hide
    >
      <div
        aria-hidden="true"
        className={cn(
          "mask-[linear-gradient(to_top,black_40%,transparent_100%)] pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300 ease-(--cf-ease)",
          showBlur ? "opacity-100 [backdrop-filter:blur(50px)]" : "opacity-0"
        )}
      />
      <FunnelSocialNav />
      <span className="text-(length:--cf-text-base) whitespace-nowrap font-legal text-cf-charcoal-900">
        @ 2025 CoinFactory AG, Zug, Switzerland
      </span>
    </footer>
  );
}
