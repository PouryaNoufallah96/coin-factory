import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_DESCRIPTION } from "@/config/site";
import { FunnelApp } from "@/features/inquiries/components/funnel-app";
import {
  CategoryChipsSkeleton,
  FunnelCategoryChips,
} from "@/features/inquiries/components/funnel-category-chips";
import {
  FunnelWizard,
  WizardSkeleton,
} from "@/features/inquiries/components/funnel-wizard";

export const metadata: Metadata = {
  title: "CoinFactory",
  description: SITE_DESCRIPTION,
};

// Hero, search, and chrome need no data and stay in the static PPR shell; the
// chips and wizard stream from connection()-gated islands (also a DB-free build).
export default function Page() {
  return (
    <FunnelApp
      categoriesSlot={
        <Suspense fallback={<CategoryChipsSkeleton />}>
          <FunnelCategoryChips />
        </Suspense>
      }
      wizardSlot={
        <Suspense fallback={<WizardSkeleton />}>
          <FunnelWizard />
        </Suspense>
      }
    />
  );
}
