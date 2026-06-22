import type { Metadata } from "next";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { buildAdminRowsVersion } from "@/features/admin/lib/build-admin-rows-version";
import { getAdminInquiries } from "@/features/inquiries/api/server/get-admin-inquiries";
import { InquiriesAdminManager } from "@/features/inquiries/components/inquiries-admin-manager";
import { adminInquiryOrderBy } from "@/features/inquiries/schemas/admin-inquiry";
import { loadFilterParams, normalizeFilterParams } from "@/lib/filter-params";

export const metadata: Metadata = {
  title: "Inquiries",
};

export default function AdminInquiriesPage(
  props: PageProps<"/admin/inquiries">
) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl text-cf-text-primary tracking-normal sm:text-3xl">
          Inquiries
        </h1>
        <p className="max-w-2xl text-cf-text-muted text-sm leading-6">
          Review founder submissions, files, and notification status.
        </p>
      </section>
      <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={6} />}>
        <AdminInquiriesContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function AdminInquiriesContent({
  searchParams,
}: {
  searchParams: PageProps<"/admin/inquiries">["searchParams"];
}) {
  const rawFilters = loadFilterParams(await searchParams);
  const filters = normalizeFilterParams(rawFilters, {
    allowedOrderBy: adminInquiryOrderBy,
  });
  const input = {
    orderBy: filters.orderBy || "createdAt",
    orderDirection: filters.orderBy ? filters.orderDirection : "desc",
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.search,
    showDeleted: false,
  };
  const data = await getAdminInquiries(input);

  return (
    <InquiriesAdminManager
      key={buildAdminRowsVersion(data.rows, input, (row) =>
        [
          row.id,
          row.status,
          row.notifiedAt?.toISOString() ?? "",
          row.notificationError ?? "",
          row.updatedAt.toISOString(),
        ].join(":")
      )}
      rows={data.rows}
      showHeader={false}
      totalRows={data.totalRows}
    />
  );
}
