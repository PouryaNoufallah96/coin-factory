import "server-only";

import { listNotificationRecipients } from "@/features/settings/db/queries";
import { notificationRecipientListOutputSchema } from "@/features/settings/schemas/notification-recipient";

export async function getNotificationRecipients() {
  return notificationRecipientListOutputSchema.parse({
    recipients: await listNotificationRecipients(),
  });
}
