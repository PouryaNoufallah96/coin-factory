import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { getActiveCategories } from "@/features/categories/api/server/get-active-categories";
import {
  LandingCategoryChips,
  LandingPage,
} from "@/features/inquiries/components/landing-page";

export const metadata: Metadata = {
  title: "CoinFactory",
  description:
    "Swiss B2B lead qualification for real-world asset tokenization with CoinFactory AG.",
};

const CATEGORY_SKELETON_KEYS = [
  "category-loading-luxury-hotel",
  "category-loading-gold-mine",
  "category-loading-ai-startup",
  "category-loading-solar-farm",
  "category-loading-oil-refinery",
  "category-loading-football-club",
  "category-loading-factory",
];

export default function Page() {
  return (
    <LandingPage>
      <Suspense fallback={<CategoryChipsFallback />}>
        <LandingCategorySection />
      </Suspense>
    </LandingPage>
  );
}

async function LandingCategorySection() {
  const categories = await getActiveCategories();

  return <LandingCategoryChips categories={categories} />;
}

function CategoryChipsFallback() {
  return (
    <div className="cf-chip-container scrollbar-none min-h-10 min-w-0 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max min-w-full flex-nowrap justify-center gap-4 px-1">
        {CATEGORY_SKELETON_KEYS.map((key) => (
          <Skeleton
            className="h-[35px] w-28 shrink-0 rounded-full bg-cf-chip-bg"
            key={key}
          />
        ))}
      </div>
    </div>
  );
}
