import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/features/admin/components/admin-section-placeholder";

export const metadata: Metadata = {
  title: "Questions",
};

export default function AdminQuestionsPage() {
  return (
    <AdminSectionPlaceholder eyebrow="Questions" title="Question management" />
  );
}
