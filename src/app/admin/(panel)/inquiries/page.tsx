import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/features/admin/components/admin-section-placeholder";

export const metadata: Metadata = {
  title: "Inquiries",
};

export default function AdminInquiriesPage() {
  return <AdminSectionPlaceholder eyebrow="Inquiries" title="Inquiry review" />;
}
