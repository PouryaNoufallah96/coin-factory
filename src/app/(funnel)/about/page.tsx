import type { Metadata } from "next";

import { SITE_DESCRIPTION } from "@/config/site";
import { AboutPage } from "@/features/about/components/about-page";

export const metadata: Metadata = {
  title: "About Us | CoinFactory",
  description: SITE_DESCRIPTION,
};

export default function Page() {
  return <AboutPage />;
}
