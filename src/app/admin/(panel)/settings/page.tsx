import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { getNotificationRecipients } from "@/features/settings/api/server/get-notification-recipients";
import { NotificationRecipientsSettings } from "@/features/settings/components/notification-recipients-settings";

export const metadata: Metadata = {
  title: "Settings",
};

export default function AdminSettingsPage(
  _props: PageProps<"/admin/settings">
) {
  return (
    <Suspense fallback={<NotificationRecipientsSettingsSkeleton />}>
      <NotificationRecipientsSettingsContent />
    </Suspense>
  );
}

async function NotificationRecipientsSettingsContent() {
  // connection() defers the read to request time so the image builds without a
  // database; it still caches at runtime via "use cache".
  await connection();

  const { recipients } = await getNotificationRecipients();

  return <NotificationRecipientsSettings recipients={recipients} />;
}

function NotificationRecipientsSettingsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20 rounded-(--cf-radius-pill)" />
        <Skeleton className="h-9 w-72 max-w-full rounded-(--cf-radius-pill)" />
        <Skeleton className="h-5 w-full max-w-xl rounded-(--cf-radius-pill)" />
      </section>
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <Skeleton className="order-2 h-56 rounded-(--cf-radius-alert) lg:order-1" />
        <Skeleton className="order-1 h-56 rounded-(--cf-radius-alert) lg:order-2" />
      </section>
    </div>
  );
}
