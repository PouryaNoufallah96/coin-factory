import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { getActiveCategories } from "@/features/categories/api/server/get-active-categories";
import { FunnelPageTransition } from "@/features/inquiries/components/funnel-page-transition";
import { FunnelReveal } from "@/features/inquiries/components/funnel-reveal";
import { FunnelRevealFallback } from "@/features/inquiries/components/funnel-reveal-fallback";
import {
  LandingCategoryChips,
  LandingPage,
} from "@/features/inquiries/components/landing-page";

const CATEGORY_SKELETON_KEYS = [
  "category-loading-luxury-hotel",
  "category-loading-gold-mine",
  "category-loading-ai-startup",
  "category-loading-solar-farm",
  "category-loading-oil-refinery",
  "category-loading-football-club",
  "category-loading-factory",
];

export const metadata: Metadata = {
  title: "Tokenize",
  description:
    "Start a private CoinFactory tokenization inquiry for your real-world asset or business project.",
};

export default function Page() {
  return (
    <FunnelPageTransition>
      <LandingPage>
        <Suspense
          fallback={
            <FunnelRevealFallback>
              <CategoryChipsFallback />
            </FunnelRevealFallback>
          }
        >
          <FunnelReveal>
            <LandingCategorySection />
          </FunnelReveal>
        </Suspense>
      </LandingPage>
    </FunnelPageTransition>
  );
}

async function LandingCategorySection() {
  const categories = await getActiveCategories();

  return <LandingCategoryChips categories={categories} />;
}

function CategoryChipsFallback() {
  return (
    <div className="cf-chip-container min-h-10 min-w-0 pb-1">
      <div className="flex w-max min-w-full justify-center gap-4 px-1">
        {CATEGORY_SKELETON_KEYS.map((key) => (
          <Skeleton
            className="h-(--cf-chip-h) w-28 shrink-0 rounded-full bg-cf-chip-bg"
            key={key}
          />
        ))}
      </div>
    </div>
  );
}
