import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

interface AdminSectionPlaceholderProps {
  eyebrow: string;
  title: string;
}

export function AdminSectionPlaceholder({
  eyebrow,
  title,
}: AdminSectionPlaceholderProps) {
  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <section className="flex flex-col gap-2">
        <p className="text-cf-cream text-sm">{eyebrow}</p>
        <h1 className="font-semibold text-2xl text-cf-text-primary tracking-normal sm:text-3xl">
          {title}
        </h1>
      </section>
      <DataTableSkeleton columnCount={4} rowCount={4} />
    </div>
  );
}
