import type { Metadata } from "next";

import { FunnelPageTransition } from "@/features/inquiries/components/funnel-page-transition";
import { ThankYouPage } from "@/features/inquiries/components/thank-you-page";

export const metadata: Metadata = {
  title: "Thank You",
};

export default function Page() {
  return (
    <FunnelPageTransition>
      <ThankYouPage />
    </FunnelPageTransition>
  );
}
