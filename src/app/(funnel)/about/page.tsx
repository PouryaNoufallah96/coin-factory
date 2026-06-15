import type { Metadata } from "next";

import { AboutPage } from "@/features/about/components/about-page";

export const metadata: Metadata = {
  title: "About Us | CoinFactory",
  description:
    "CoinFactory is a tokenization company, helping businesses transform assets, communities, products, and ventures into blockchain-powered economies.",
};

export default function Page() {
  return <AboutPage />;
}
