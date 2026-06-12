interface AdminRowVersionFields {
  active: boolean;
  deletedAt: Date | string | null;
  id: string;
  sortOrder: number;
  updatedAt: Date | string;
}

interface AdminListQueryVersion {
  orderBy: string;
  orderDirection: string;
  page: number;
  pageSize: number;
  search: string;
  showDeleted: boolean;
}

export function buildAdminRowsVersion<TRow extends AdminRowVersionFields>(
  rows: TRow[],
  input: AdminListQueryVersion
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
        toTimestampToken(row.updatedAt),
        toTimestampToken(row.deletedAt),
      ].join(":")
    )
    .join("|");

  return `${queryVersion}|${rowVersion}`;
}

function toTimestampToken(value: Date | string | null) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.toISOString();
}
