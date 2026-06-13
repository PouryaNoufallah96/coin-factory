import { Menu } from "lucide-react";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";

import { MaskIcon } from "@/components/common/mask-icon";
import { FunnelFooter } from "@/features/inquiries/components/funnel-footer";
import { FunnelSpotlights } from "@/features/inquiries/components/funnel-spotlights";

export function FunnelShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden text-cf-text-primary">
      <Suspense fallback={null}>
        <FunnelSpotlights />
      </Suspense>
      <header className="relative z-20 flex h-(--cf-header-h) shrink-0 items-center justify-between px-(--cf-page-x)">
        <Link
          aria-label="CoinFactory home"
          className="flex items-center gap-1 text-cf-cream"
          href="/"
          transitionTypes={["nav-back"]}
        >
          <MaskIcon
            className="h-(--cf-logo-mark-h) w-(--cf-logo-mark-w)"
            src="/brand/logo-c.svg"
          />
          <span className="text-(length:--cf-text-logo) font-logo leading-none">
            coinfactory
          </span>
        </Link>
        <div
          aria-hidden="true"
          className="flex size-(--cf-touch) items-center justify-center rounded-(--cf-radius-icon) text-cf-cream"
        >
          <Menu className="size-5" />
        </div>
      </header>
      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto">
        {children}
      </main>
      <Suspense fallback={null}>
        <FunnelFooter />
      </Suspense>
    </div>
  );
}
