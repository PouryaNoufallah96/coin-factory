"use server";

import { headers } from "next/headers";

import { withAdminMutationRefresh } from "@/features/admin/actions/with-admin-mutation-refresh";
import { updateNotificationRecipientTags } from "@/features/settings/db/cache/tags";
import type { NotificationRecipientActionInput } from "@/features/settings/schemas/notification-recipient";
import { createRpcContext } from "@/server/rpc/context";
import { appRouter } from "@/server/rpc/routers";

const actionOptions = {
  context: async () => createRpcContext({ headers: await headers() }),
};

export const addNotificationRecipient = withAdminMutationRefresh(
  appRouter.settings.admin.addRecipient.actionable(actionOptions),
  () => updateNotificationRecipientTags()
);

export const removeNotificationRecipient = withAdminMutationRefresh(
  appRouter.settings.admin.removeRecipient.actionable(actionOptions),
  (input) => updateNotificationRecipientTags(input.id)
);

export async function runNotificationRecipientAction(
  input: NotificationRecipientActionInput
) {
  switch (input.type) {
    case "add":
      return await addNotificationRecipient({ email: input.email });
    case "remove":
      return await removeNotificationRecipient({ id: input.id });
    default:
      throw new Error("Unsupported notification recipient action.");
  }
}
