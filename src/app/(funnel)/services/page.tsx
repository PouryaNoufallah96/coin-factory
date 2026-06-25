import type { Metadata } from "next";

import { SITE_DESCRIPTION } from "@/config/site";
import { ServicesPage } from "@/features/services/components/services-page";

export const metadata: Metadata = {
  title: "Services | CoinFactory",
  description: SITE_DESCRIPTION,
};

export default function Page() {
  return <ServicesPage />;
}
