import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SITE_DESCRIPTION } from "@/config/site";

export const metadata: Metadata = {
  title: "CoinFactory",
  description: SITE_DESCRIPTION,
};

export default function CatchAll() {
  redirect("/");
}
