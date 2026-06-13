"use server";

import { headers } from "next/headers";

import { withAdminMutationRefresh } from "@/features/admin/actions/with-admin-mutation-refresh";
import { updateInquiryTags } from "@/features/inquiries/db/cache/tags";
import type { AdminInquiryRowActionInput } from "@/features/inquiries/schemas/admin-inquiry";
import { createRpcContext } from "@/server/rpc/context";
import { appRouter } from "@/server/rpc/routers";

const actionOptions = {
  context: async () => createRpcContext({ headers: await headers() }),
};

export const setInquiryStatus = withAdminMutationRefresh(
  appRouter.inquiries.admin.setStatus.actionable(actionOptions),
  (input) => updateInquiryTags(input.id)
);

export const resendInquiryNotification = withAdminMutationRefresh(
  appRouter.inquiries.admin.resendNotification.actionable(actionOptions),
  (input) => updateInquiryTags(input.id)
);

export async function runInquiryRowAction(input: AdminInquiryRowActionInput) {
  switch (input.type) {
    case "setStatus":
      return await setInquiryStatus({ id: input.id, status: input.status });
    case "resendNotification":
      return await resendInquiryNotification({ id: input.id });
    default:
      throw new Error("Unsupported inquiry row action.");
  }
}
