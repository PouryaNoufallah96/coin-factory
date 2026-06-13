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

export function buildAdminListQueryVersion(input: AdminListQueryVersion) {
  return [
    input.orderBy,
    input.orderDirection,
    input.page,
    input.pageSize,
    input.search,
    input.showDeleted,
  ].join(":");
}

export function buildAdminRowsVersion<TRow extends AdminRowVersionFields>(
  rows: TRow[],
  input: AdminListQueryVersion
): string;

export function buildAdminRowsVersion<TRow>(
  rows: TRow[],
  input: AdminListQueryVersion,
  serializeRow: (row: TRow) => string
): string;

export function buildAdminRowsVersion<TRow>(
  rows: TRow[],
  input: AdminListQueryVersion,
  serializeRow?: (row: TRow) => string
) {
  const rowVersion = rows
    .map((row) =>
      serializeRow
        ? serializeRow(row)
        : serializeOrderedEntityRow(row as AdminRowVersionFields)
    )
    .join("|");

  return `${buildAdminListQueryVersion(input)}|${rowVersion}`;
}

function serializeOrderedEntityRow(row: AdminRowVersionFields) {
  return [
    row.id,
    row.sortOrder,
    row.active,
    toTimestampToken(row.updatedAt),
    toTimestampToken(row.deletedAt),
  ].join(":");
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
