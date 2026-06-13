export interface NotificationRecipientEmail {
  email: string;
}

export function normalizeNotificationRecipientEmail(email: string) {
  return email.trim().toLowerCase();
}

export function resolveNotificationRecipients(
  recipients: readonly NotificationRecipientEmail[],
  fallback: string
) {
  if (recipients.length === 0) {
    return [fallback];
  }

  return recipients.map((recipient) => recipient.email);
}
