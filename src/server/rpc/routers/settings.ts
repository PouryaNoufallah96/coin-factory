import "server-only";

import { ORPCError } from "@orpc/server";

import { findDbError } from "@/features/admin/lib/find-db-error";
import { okOutputSchema } from "@/features/admin/schemas/ok-output";
import { revalidateNotificationRecipientTags } from "@/features/settings/db/cache/tags";
import {
  countNotificationRecipients,
  deleteNotificationRecipient,
  insertNotificationRecipient,
  listNotificationRecipients,
  lockNotificationRecipientAdds,
} from "@/features/settings/db/queries";
import { normalizeNotificationRecipientEmail } from "@/features/settings/lib/notification-recipients";
import {
  addNotificationRecipientInputSchema,
  MAX_NOTIFICATION_RECIPIENTS,
  notificationRecipientListOutputSchema,
  removeNotificationRecipientInputSchema,
} from "@/features/settings/schemas/notification-recipient";

import { adminProcedure } from "../middleware";

const UNIQUE_VIOLATION_CODE = "23505";

const listRecipients = adminProcedure
  .output(notificationRecipientListOutputSchema)
  .handler(async ({ context }) => ({
    recipients: await listNotificationRecipients(context.db),
  }));

const addRecipient = adminProcedure
  .input(addNotificationRecipientInputSchema)
  .output(okOutputSchema)
  .handler(async ({ context, input }) => {
    const adminSession = requireAdminSession(context.adminSession);
    const normalizedEmail = normalizeNotificationRecipientEmail(input.email);
    const recipient = await context.db.transaction(async (tx) => {
      await lockNotificationRecipientAdds(tx);
      const recipientCount = await countNotificationRecipients(tx);

      if (recipientCount >= MAX_NOTIFICATION_RECIPIENTS) {
        throw new ORPCError("BAD_REQUEST", {
          message: `Keep notification recipients to ${MAX_NOTIFICATION_RECIPIENTS} or fewer.`,
        });
      }

      try {
        const created = await insertNotificationRecipient(
          { email: normalizedEmail },
          tx
        );

        if (!created) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Notification recipient could not be added.",
          });
        }

        return created;
      } catch (error) {
        if (findDbError(error, UNIQUE_VIOLATION_CODE)) {
          throw new ORPCError("CONFLICT", {
            message: "That notification recipient already exists.",
          });
        }

        throw error;
      }
    });

    logRecipientChange({
      action: "notification_recipient.added",
      actorId: adminSession.user.id,
      email: normalizedEmail,
      recipientId: recipient.id,
    });

    revalidateNotificationRecipientTags(recipient.id);
    return { ok: true as const };
  });

const removeRecipient = adminProcedure
  .input(removeNotificationRecipientInputSchema)
  .output(okOutputSchema)
  .handler(async ({ context, input }) => {
    const adminSession = requireAdminSession(context.adminSession);
    const deleted = await deleteNotificationRecipient(input.id, context.db);

    if (!deleted) {
      throw new ORPCError("NOT_FOUND", {
        message: "Notification recipient was not found.",
      });
    }

    logRecipientChange({
      action: "notification_recipient.removed",
      actorId: adminSession.user.id,
      email: normalizeNotificationRecipientEmail(deleted.email),
      recipientId: deleted.id,
    });

    revalidateNotificationRecipientTags(deleted.id);
    return { ok: true as const };
  });

export const settingsRouter = {
  admin: {
    addRecipient,
    listRecipients,
    removeRecipient,
  },
};

function requireAdminSession<TSession>(
  session: TSession | undefined
): TSession {
  if (!session) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Admin sign-in required.",
    });
  }

  return session;
}

function logRecipientChange({
  action,
  actorId,
  email,
  recipientId,
}: {
  action: "notification_recipient.added" | "notification_recipient.removed";
  actorId: string;
  email: string;
  recipientId: string;
}) {
  console.info(
    JSON.stringify({
      action,
      actorId,
      email,
      recipientId,
    })
  );
}
