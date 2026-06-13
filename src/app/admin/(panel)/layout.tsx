import { redirect } from "next/navigation";
import { Suspense, ViewTransition } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import {
  AdminShell,
  AdminShellFallback,
} from "@/features/admin/components/admin-shell";
import { FILTER_TRANSITION_TYPE } from "@/hooks/filter-transition-types";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-redirect";
import { getCurrentAdminSession } from "@/server/auth/session";

export default function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <AdminShellFallback>
          <DataTableSkeleton columnCount={5} rowCount={5} />
        </AdminShellFallback>
      }
    >
      <AdminPanelSessionGate>{children}</AdminPanelSessionGate>
    </Suspense>
  );
}

async function AdminPanelSessionGate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminSession = await getCurrentAdminSession();

  if (!adminSession) {
    redirect(ADMIN_LOGIN_PATH);
  }

  return (
    <AdminShell userEmail={adminSession.user.email}>
      <ViewTransition
        default={{
          [FILTER_TRANSITION_TYPE]: "none",
          default: "auto",
        }}
      >
        {children}
      </ViewTransition>
    </AdminShell>
  );
}
