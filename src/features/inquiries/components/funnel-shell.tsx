import { Menu } from "lucide-react";
import { type ReactNode, Suspense } from "react";

import { Toaster } from "@/components/ui/sonner";
import { FunnelFooter } from "@/features/inquiries/components/funnel-footer";
import { FunnelLogo } from "@/features/inquiries/components/funnel-logo";
import { FunnelSpotlights } from "@/features/inquiries/components/funnel-spotlights";

export function FunnelShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden text-cf-text-primary">
      <Suspense fallback={null}>
        <FunnelSpotlights />
      </Suspense>
      <header className="relative z-20 flex h-(--cf-header-h) shrink-0 items-center justify-between px-(--cf-page-x)">
        <FunnelLogo />
        <div
          aria-hidden="true"
          className="flex size-(--cf-touch) items-center justify-center rounded-(--cf-radius-icon) text-cf-cream"
        >
          <Menu className="size-7" />
        </div>
      </header>
      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto">
        {children}
      </main>
      <Suspense fallback={null}>
        <FunnelFooter />
      </Suspense>
      <Toaster
        position="top-left"
        closeButton
        expand
        toastOptions={{
          classNames: {
            toast: "w-max! max-w-[80vw]! whitespace-normal!",
            error:
              "bg-cf-error! text-cf-text-on-error! border-0! rounded-(--cf-radius-alert)! min-h-14 font-medium pr-15!",
            icon: "text-cf-text-on-error!",
            closeButton:
              "!left-auto !right-2 !top-1/2 ![transform:translateY(-50%)] !size-6 [&>svg]:!size-4 bg-cf-error! border-0! text-cf-text-on-error! hover:opacity-70!",
          },
        }}
      />
    </div>
  );
}
