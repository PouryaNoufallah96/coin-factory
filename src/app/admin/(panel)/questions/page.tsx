import type { Metadata } from "next";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { buildAdminRowsVersion } from "@/features/admin/lib/build-admin-rows-version";
import { getAdminQuestions } from "@/features/questions/api/server/get-admin-questions";
import { QuestionsAdminManager } from "@/features/questions/components/questions-admin-manager";
import { loadFilterParams, normalizeFilterParams } from "@/lib/filter-params";

export const metadata: Metadata = {
  title: "Questions",
};

const questionOrderBy = [
  "text",
  "kind",
  "sortOrder",
  "active",
  "createdAt",
] as const;

export default function AdminQuestionsPage(
  props: PageProps<"/admin/questions">
) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl text-cf-text-primary tracking-normal sm:text-3xl">
          Questions
        </h1>
        <p className="max-w-2xl text-cf-text-muted text-sm leading-6">
          Manage the ordered questions used by the onboarding wizard.
        </p>
      </section>
      <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={6} />}>
        <AdminQuestionsContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function AdminQuestionsContent({
  searchParams,
}: {
  searchParams: PageProps<"/admin/questions">["searchParams"];
}) {
  const rawFilters = loadFilterParams(await searchParams);
  const filters = normalizeFilterParams(rawFilters, {
    allowedOrderBy: questionOrderBy,
    defaultOrderBy: "sortOrder",
  });
  const input = {
    orderBy: filters.orderBy,
    orderDirection: filters.orderDirection,
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.search,
    showDeleted: filters.showDeleted,
  };
  const data = await getAdminQuestions(input);
  const rowsVersion = buildAdminRowsVersion(data.rows, input);

  return (
    <QuestionsAdminManager
      filters={{
        orderBy: input.orderBy,
        orderDirection: input.orderDirection,
        search: input.search,
        showDeleted: input.showDeleted,
      }}
      key={rowsVersion}
      orderedIds={data.orderedIds}
      rows={data.rows}
      showHeader={false}
      totalRows={data.totalRows}
    />
  );
}
