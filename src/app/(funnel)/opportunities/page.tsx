import type { Metadata } from "next";

import { OpportunitiesPage } from "@/features/opportunities/components/opportunities-page";

export const metadata: Metadata = {
  title: "Tokenization Opportunities | CoinFactory",
  description:
    "Explore the tokenization opportunities CoinFactory enables across assets, equity, revenue, debt, infrastructure, communities, and digital ecosystems.",
};

export default function Page() {
  return <OpportunitiesPage />;
}
