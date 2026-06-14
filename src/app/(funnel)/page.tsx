import type { Metadata } from "next";

import { getActiveCategories } from "@/features/categories/api/server/get-active-categories";
import { getActiveQuestions } from "@/features/questions/api/server/get-active-questions";
import { FunnelApp } from "@/features/inquiries/components/funnel-app";

export const metadata: Metadata = {
  title: "Tokenize",
  description:
    "Start a private CoinFactory tokenization inquiry for your real-world asset or business project.",
};

export default async function Page() {
  const [categories, questions] = await Promise.all([
    getActiveCategories(),
    getActiveQuestions(),
  ]);

  return <FunnelApp categories={categories} questions={questions} />;
}
