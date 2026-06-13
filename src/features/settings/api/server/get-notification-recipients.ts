import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { idTag } from "@/lib/cache-tags";
import { notificationRecipientTags } from "../../db/cache/tags";
import { listNotificationRecipients } from "../../db/queries";
import { notificationRecipientListOutputSchema } from "../../schemas/notification-recipient";

export async function getNotificationRecipients() {
  "use cache";
  cacheTag(notificationRecipientTags.adminList());
  cacheLife("hours");

  const recipients = await listNotificationRecipients();
  const data = notificationRecipientListOutputSchema.parse({
    recipients,
  });

  for (const recipient of data.recipients) {
    cacheTag(idTag("notification_recipient", recipient.id));
  }

  return data;
}
