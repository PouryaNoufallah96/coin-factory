import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminInquiry } from "@/features/inquiries/api/server/get-admin-inquiries";
import { InquiryDetail } from "@/features/inquiries/components/inquiry-detail";

export const metadata: Metadata = {
  title: "Inquiry details",
};

export default function AdminInquiryDetailPage(
  props: PageProps<"/admin/inquiries/[id]">
) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex min-w-0 flex-col gap-2">
        <Button
          className="mb-1 w-fit"
          nativeButton={false}
          render={<Link href="/admin/inquiries" />}
          size="sm"
          variant="ghost"
        >
          <ArrowLeft data-icon="inline-start" />
          Inquiries
        </Button>
        <h1 className="font-semibold text-2xl text-cf-text-primary tracking-normal sm:text-3xl">
          Inquiry details
        </h1>
      </div>
      <Suspense fallback={<InquiryDetailSkeleton />}>
        <AdminInquiryDetailContent params={props.params} />
      </Suspense>
    </div>
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

  return <InquiryDetail inquiry={inquiry} showHeader={false} />;
}

function InquiryDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-5 w-36 rounded-(--cf-radius-pill)" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-(--cf-radius-pill)" />
          <Skeleton className="h-9 w-32 rounded-(--cf-radius-pill)" />
        </div>
      </div>
      <section className="grid gap-4 border-cf-border-muted/40 border-y py-5 sm:grid-cols-2">
        {["email", "whatsapp", "notification", "updated"].map((item) => (
          <div className="flex flex-col gap-2" key={item}>
            <Skeleton className="h-3 w-20 rounded-(--cf-radius-pill)" />
            <Skeleton className="h-4 w-48 max-w-full rounded-(--cf-radius-pill)" />
          </div>
        ))}
      </section>
      <Skeleton className="h-28 rounded-(--cf-radius-card)" />
      <Skeleton className="h-24 rounded-(--cf-radius-card)" />
    </div>
  );
}
