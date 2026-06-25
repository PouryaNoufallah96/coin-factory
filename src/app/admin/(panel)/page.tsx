import type { Metadata } from "next";

import { AdminInquiriesPageContent } from "@/features/inquiries/components/admin-inquiries-page-content";

export const metadata: Metadata = {
  title: "Inquiries",
};

export default function AdminPage(props: PageProps<"/admin">) {
  return <AdminInquiriesPageContent searchParams={props.searchParams} />;
}
