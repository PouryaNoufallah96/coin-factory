import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "CoinFactory",
  description:
    "Start a private CoinFactory tokenization inquiry for your real-world asset or business project.",
};

export default function CatchAll() {
  redirect("/");
}
