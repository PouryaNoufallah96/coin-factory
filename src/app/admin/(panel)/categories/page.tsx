import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/features/admin/components/admin-section-placeholder";

export const metadata: Metadata = {
  title: "Categories",
};

export default function AdminCategoriesPage() {
  return (
    <AdminSectionPlaceholder eyebrow="Categories" title="Category management" />
  );
}
