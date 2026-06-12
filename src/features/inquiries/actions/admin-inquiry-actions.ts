"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";

import type { AdminInquiryRowActionInput } from "@/features/inquiries/schemas/admin-inquiry";
import { createRpcContext } from "@/server/rpc/context";
import { appRouter } from "@/server/rpc/routers";

type ActionResult = readonly [unknown, unknown];

const actionOptions = {
  context: async () => createRpcContext({ headers: await headers() }),
};

function withAdminInquiryRefresh<TInput, TResult extends ActionResult>(
  action: (input: TInput) => Promise<TResult>
) {
  return async (input: TInput): Promise<TResult> => {
    const result = await action(input);

    if (!result[0]) {
      refresh();
    }

    return result;
  };
}

export const setInquiryStatus = withAdminInquiryRefresh(
  appRouter.inquiries.admin.setStatus.actionable(actionOptions)
);

export const resendInquiryNotification = withAdminInquiryRefresh(
  appRouter.inquiries.admin.resendNotification.actionable(actionOptions)
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
