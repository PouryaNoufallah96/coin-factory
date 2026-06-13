"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";

import type { NotificationRecipientActionInput } from "@/features/settings/schemas/notification-recipient";
import { createRpcContext } from "@/server/rpc/context";
import { appRouter } from "@/server/rpc/routers";

type ActionResult = readonly [unknown, unknown];

const actionOptions = {
  context: async () => createRpcContext({ headers: await headers() }),
};

const addNotificationRecipient =
  appRouter.settings.admin.addRecipient.actionable(actionOptions);

const removeNotificationRecipient =
  appRouter.settings.admin.removeRecipient.actionable(actionOptions);

export async function runNotificationRecipientAction(
  input: NotificationRecipientActionInput
) {
  switch (input.type) {
    case "add":
      return await withSettingsRefresh(
        addNotificationRecipient({ email: input.email })
      );
    case "remove":
      return await withSettingsRefresh(
        removeNotificationRecipient({ id: input.id })
      );
    default:
      throw new Error("Unsupported notification recipient action.");
  }
}

async function withSettingsRefresh<TResult extends ActionResult>(
  resultPromise: Promise<TResult>
): Promise<TResult> {
  const result = await resultPromise;

  if (!result[0]) {
    refresh();
  }

  return result;
}
