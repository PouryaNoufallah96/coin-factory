import type { Metadata } from "next";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
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
    <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={6} />}>
      <AdminQuestionsContent searchParams={props.searchParams} />
    </Suspense>
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
  const rowsVersion = getQuestionRowsVersion(data.rows, input);

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
      totalRows={data.totalRows}
    />
  );
}

function getQuestionRowsVersion(
  rows: Awaited<ReturnType<typeof getAdminQuestions>>["rows"],
  input: {
    orderBy: string;
    orderDirection: string;
    page: number;
    pageSize: number;
    search: string;
    showDeleted: boolean;
  }
) {
  const queryVersion = [
    input.orderBy,
    input.orderDirection,
    input.page,
    input.pageSize,
    input.search,
    input.showDeleted,
  ].join(":");
  const rowVersion = rows
    .map((row) =>
      [
        row.id,
        row.sortOrder,
        row.active,
        row.updatedAt.toISOString(),
        row.deletedAt?.toISOString() ?? "",
      ].join(":")
    )
    .join("|");

  return `${queryVersion}|${rowVersion}`;
}
