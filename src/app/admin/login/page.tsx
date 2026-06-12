import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { MaskIcon } from "@/components/common/mask-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLoginForm } from "@/features/admin/components/admin-login-form";
import { adminRedirectPath } from "@/lib/admin-redirect";
import { ensureSeedAdmin } from "@/server/auth/seed-admin";
import { getCurrentAdminSession } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default function AdminLoginPage(props: PageProps<"/admin/login">) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-cf-charcoal-900 px-4 py-10 text-cf-text-primary">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-cf-cream">
            <MaskIcon className="h-9 w-8" src="/brand/logo-c.svg" />
            <span className="font-logo text-2xl leading-none">coinfactory</span>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-semibold text-2xl text-cf-text-primary tracking-normal">
              Admin sign in
            </h1>
            <p className="text-cf-text-muted text-sm leading-6">
              Team access only.
            </p>
          </div>
        </div>
        <div className="rounded-(--cf-radius-panel) border border-cf-border-muted/40 bg-cf-surface-muted p-5 shadow-(--cf-glow-soft)">
          <Suspense fallback={<AdminLoginFormFallback />}>
            <AdminLoginPanel searchParams={props.searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function AdminLoginPanel({
  searchParams,
}: {
  searchParams: PageProps<"/admin/login">["searchParams"];
}) {
  await ensureSeedAdmin();
  const params = await searchParams;
  const redirectTo = adminRedirectPath(
    Array.isArray(params.redirectTo) ? params.redirectTo[0] : params.redirectTo
  );
  const adminSession = await getCurrentAdminSession();

  if (adminSession) {
    redirect(redirectTo as Route);
  }

  return <AdminLoginForm redirectTo={redirectTo} />;
}

function AdminLoginFormFallback() {
  return (
    <div aria-busy="true" className="flex w-full flex-col gap-5">
      <Skeleton className="h-14 w-full rounded-(--cf-radius-pill)" />
      <Skeleton className="h-14 w-full rounded-(--cf-radius-pill)" />
      <Skeleton className="h-12 w-full rounded-(--cf-radius-pill)" />
      <output className="sr-only">Loading admin sign in</output>
    </div>
  );
}
