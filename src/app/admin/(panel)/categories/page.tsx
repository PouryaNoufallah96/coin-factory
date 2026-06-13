import type { Metadata } from "next";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { buildAdminRowsVersion } from "@/features/admin/lib/build-admin-rows-version";
import { getAdminCategories } from "@/features/categories/api/server/get-admin-categories";
import { CategoriesAdminManager } from "@/features/categories/components/categories-admin-manager";
import { loadFilterParams, normalizeFilterParams } from "@/lib/filter-params";

export const metadata: Metadata = {
  title: "Categories",
};

const categoryOrderBy = ["label", "sortOrder", "active", "createdAt"] as const;

export default function AdminCategoriesPage(
  props: PageProps<"/admin/categories">
) {
  return (
    <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={6} />}>
      <AdminCategoriesContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function AdminCategoriesContent({
  searchParams,
}: {
  searchParams: PageProps<"/admin/categories">["searchParams"];
}) {
  const rawFilters = loadFilterParams(await searchParams);
  const filters = normalizeFilterParams(rawFilters, {
    allowedOrderBy: categoryOrderBy,
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
  const data = await getAdminCategories(input);
  const rowsVersion = buildAdminRowsVersion(data.rows, input);

  return (
    <CategoriesAdminManager
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
