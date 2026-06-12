import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/features/admin/components/admin-section-placeholder";

export const metadata: Metadata = {
  title: "Settings",
};

export default function AdminSettingsPage() {
  return (
    <AdminSectionPlaceholder eyebrow="Settings" title="Notification settings" />
  );
}
