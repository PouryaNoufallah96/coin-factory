import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
}

export function DataTableSkeleton({
  columnCount = 4,
  rowCount = 6,
}: DataTableSkeletonProps) {
  const columns = Array.from({ length: columnCount }, (_, index) => index);
  const rows = Array.from({ length: rowCount }, (_, index) => index);

  return (
    <div
      aria-busy="true"
      className="overflow-hidden rounded-(--cf-radius-alert) border bg-card"
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>
                <Skeleton className="h-4 w-24 rounded-(--cf-radius-pill)" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row}>
              {columns.map((column) => (
                <TableCell key={column}>
                  <Skeleton className="h-4 w-full min-w-20 rounded-(--cf-radius-pill)" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <output className="sr-only">Loading table</output>
    </div>
  );
}
