import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { getAdminInquiry } from "@/features/inquiries/api/server/get-admin-inquiries";
import { InquiryDetail } from "@/features/inquiries/components/inquiry-detail";

export const metadata: Metadata = {
  title: "Inquiry details",
};

export default function AdminInquiryDetailPage(
  props: PageProps<"/admin/inquiries/[id]">
) {
  return (
    <Suspense fallback={<DataTableSkeleton columnCount={2} rowCount={4} />}>
      <AdminInquiryDetailContent params={props.params} />
    </Suspense>
  );
}

async function AdminInquiryDetailContent({
  params,
}: {
  params: PageProps<"/admin/inquiries/[id]">["params"];
}) {
  const { id } = await params;
  const inquiry = await getAdminInquiry(id);

  if (!inquiry) {
    notFound();
  }

  return <InquiryDetail inquiry={inquiry} />;
}
