import "server-only";

import { revalidateTag, updateTag } from "next/cache";

import { globalTag, idTag } from "@/lib/cache-tags";

export const notificationRecipientTags = {
  /** Tag carried by every cached notification-recipient list read. */
  adminList: () => `${globalTag("notification_recipient")}:admin` as const,
};

function fanOutNotificationRecipientTags(id?: string) {
  updateTag(notificationRecipientTags.adminList());

  if (id) {
    updateTag(idTag("notification_recipient", id));
  }
}

function revalidateNotificationRecipientTagFanOut(id?: string) {
  revalidateTag(notificationRecipientTags.adminList(), "max");

  if (id) {
    revalidateTag(idTag("notification_recipient", id), "max");
  }
}

export function updateNotificationRecipientTags(id?: string) {
  fanOutNotificationRecipientTags(id);
}

export function revalidateNotificationRecipientTags(id?: string) {
  revalidateNotificationRecipientTagFanOut(id);
}
