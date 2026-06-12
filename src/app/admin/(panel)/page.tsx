import type { Metadata } from "next";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <div className="flex max-w-6xl flex-col gap-8">
      <section className="flex flex-col gap-2">
        <p className="text-cf-cream text-sm">Admin</p>
        <h1 className="font-semibold text-2xl text-cf-text-primary tracking-normal sm:text-3xl">
          Review workspace
        </h1>
        <p className="max-w-2xl text-cf-text-muted text-sm leading-6">
          Questions, categories, inquiries, and notification settings live here.
        </p>
      </section>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-medium text-cf-text-primary text-lg">
            Incoming inquiries
          </h2>
          <Badge variant="secondary">Queued</Badge>
        </div>
        <DataTableSkeleton columnCount={5} rowCount={5} />
      </section>
    </div>
  );
}
