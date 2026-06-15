import type { Metadata } from "next";

import { ServicesPage } from "@/features/services/components/services-page";

export const metadata: Metadata = {
  title: "Services | CoinFactory",
  description:
    "CoinFactory is a tokenization company, helping businesses transform assets, communities, products, and ventures into blockchain-powered economies.",
};

export default function Page() {
  return <ServicesPage />;
}
