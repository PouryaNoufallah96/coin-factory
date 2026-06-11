import type { Metadata } from "next";
import { Suspense } from "react";

import { getActiveCategories } from "@/features/categories/api/server/get-active-categories";
import { LandingPage } from "@/features/inquiries/components/landing-page";

export const metadata: Metadata = {
  title: "CoinFactory",
  description:
    "Swiss B2B lead qualification for real-world asset tokenization with CoinFactory AG.",
};

export default function Page() {
  return (
    <Suspense fallback={<LandingPage categories={[]} isLoadingCategories />}>
      <LandingCategories />
    </Suspense>
  );
}

async function LandingCategories() {
  const categories = await getActiveCategories();

  return <LandingPage categories={categories} />;
}
