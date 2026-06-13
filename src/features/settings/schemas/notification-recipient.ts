import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

import { okOutputSchema } from "@/features/admin/schemas/ok-output";
import { emailSchema } from "@/lib/schemas/email";
import { notificationRecipients } from "@/server/db/schema";

export const MAX_NOTIFICATION_RECIPIENTS = 10;

export const notificationRecipientSchema = createSelectSchema(
  notificationRecipients
);

export const adminNotificationRecipientSchema =
  notificationRecipientSchema.pick({
    id: true,
    email: true,
    createdAt: true,
  });

export type AdminNotificationRecipient = z.infer<
  typeof adminNotificationRecipientSchema
>;

export const notificationRecipientListOutputSchema = z.object({
  recipients: adminNotificationRecipientSchema.array(),
});

export const addNotificationRecipientInputSchema = z.object({
  email: emailSchema,
});

export type NotificationRecipientFormInput = z.input<
  typeof addNotificationRecipientInputSchema
>;

export const removeNotificationRecipientInputSchema = z.object({
  id: z.uuid(),
});

export const notificationRecipientActionInputSchema = z.discriminatedUnion(
  "type",
  [
    addNotificationRecipientInputSchema.extend({
      type: z.literal("add"),
    }),
    removeNotificationRecipientInputSchema.extend({
      type: z.literal("remove"),
    }),
  ]
);

export type NotificationRecipientActionInput = z.input<
  typeof notificationRecipientActionInputSchema
>;

export const notificationRecipientActionOutputSchema = okOutputSchema;
