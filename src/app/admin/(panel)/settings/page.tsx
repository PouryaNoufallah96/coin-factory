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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="text-cf-cream text-sm">Settings</p>
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-2xl text-cf-text-primary tracking-normal sm:text-3xl">
            Notification recipients
          </h1>
          <p className="max-w-2xl text-cf-text-muted text-sm leading-6">
            Manage the internal addresses that receive new inquiry emails.
          </p>
        </div>
      </section>
      <Suspense fallback={<NotificationRecipientsSettingsSkeleton />}>
        <NotificationRecipientsSettingsContent />
      </Suspense>
    </div>
  );
}

async function NotificationRecipientsSettingsContent() {
  // connection() defers the read to request time so the image builds without a
  // database; it still caches at runtime via "use cache".
  await connection();

  const { recipients } = await getNotificationRecipients();

  return (
    <NotificationRecipientsSettings
      recipients={recipients}
      showHeader={false}
    />
  );
}

function NotificationRecipientsSettingsSkeleton() {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
      <Skeleton className="order-2 h-56 rounded-(--cf-radius-alert) lg:order-1" />
      <Skeleton className="order-1 h-56 rounded-(--cf-radius-alert) lg:order-2" />
    </section>
  );
}
