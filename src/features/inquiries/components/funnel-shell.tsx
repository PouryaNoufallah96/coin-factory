import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SOCIAL_LINKS = [
  { href: "#", label: "X", platform: "x" },
  { href: "#", label: "Instagram", platform: "instagram" },
  { href: "#", label: "WhatsApp", platform: "whatsapp" },
  { href: "#", label: "Telegram", platform: "telegram" },
  { href: "#", label: "YouTube", platform: "youtube" },
  { href: "#", label: "Discord", platform: "discord" },
];

function MaskIcon({ className, src }: { className?: string; src: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block bg-current", className)}
      data-slot="mask-icon"
      style={{
        WebkitMask: `url("${src}") center / contain no-repeat`,
        mask: `url("${src}") center / contain no-repeat`,
      }}
    />
  );
}

export function FunnelShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-cf-charcoal-900 text-cf-text-primary">
      <div className="bg-(image:--cf-canvas-gradient) absolute inset-0 -z-10" />
      <div className="bg-(image:--cf-spotlight) absolute inset-0 -z-10" />
      <header className="flex h-(--cf-header-h) shrink-0 items-center justify-between px-6 sm:px-10 lg:px-(--cf-page-x)">
        <Link
          aria-label="CoinFactory home"
          className="flex items-center gap-3 text-cf-cream"
          href="/"
        >
          <MaskIcon className="h-10 w-9" src="/brand/logo-c.svg" />
          <span className="font-logo text-[27px] leading-none">
            coinfactory
          </span>
        </Link>
        <Button
          aria-label="Menu"
          className="size-12 rounded-(--cf-radius-icon) text-cf-cream hover:bg-cf-cream/10 **:data-[slot=mask-icon]:h-[18px] **:data-[slot=mask-icon]:w-[21px]"
          size="icon"
          type="button"
          variant="ghost"
        >
          <MaskIcon src="/brand/icon-menu.svg" />
        </Button>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      <footer className="flex h-(--cf-footer-h) shrink-0 items-center justify-between gap-6 px-6 sm:px-10 lg:px-(--cf-page-x)">
        <nav
          aria-label="CoinFactory social links"
          className="flex items-center gap-[18px]"
        >
          {SOCIAL_LINKS.map((link) => (
            <a
              aria-label={link.label}
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full opacity-100 transition-opacity duration-(--cf-dur-feedback) ease-(--cf-ease) hover:opacity-70",
                link.platform === "x"
                  ? "bg-cf-cream text-cf-text-on-accent"
                  : "border border-cf-cream/40 text-cf-cream"
              )}
              href={link.href}
              key={link.platform}
            >
              <MaskIcon
                className={cn(
                  link.platform === "x" ? "h-[18px] w-5" : "size-[22px]"
                )}
                src={`/brand/social-${link.platform}.svg`}
              />
            </a>
          ))}
        </nav>
        <span className="whitespace-nowrap font-legal text-cf-text-on-accent text-sm opacity-90 sm:text-base">
          @ 2026 CoinFactory AG
        </span>
      </footer>
    </div>
  );
}
