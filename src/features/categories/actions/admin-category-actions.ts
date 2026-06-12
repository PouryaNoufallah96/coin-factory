"use server";

import { headers } from "next/headers";

import { withAdminMutationRefresh } from "@/features/admin/actions/with-admin-mutation-refresh";
import { updateCategoryTags } from "@/features/categories/db/cache/tags";
import { createRpcContext } from "@/server/rpc/context";
import { appRouter } from "@/server/rpc/routers";

const actionOptions = {
  context: async () => createRpcContext({ headers: await headers() }),
};

export const createCategory = withAdminMutationRefresh(
  appRouter.categories.admin.create.actionable(actionOptions),
  updateCategoryTags
);

export const updateCategory = withAdminMutationRefresh(
  appRouter.categories.admin.update.actionable(actionOptions),
  updateCategoryTags
);

export const reorderCategories = withAdminMutationRefresh(
  appRouter.categories.admin.reorder.actionable(actionOptions),
  updateCategoryTags
);

export const setCategoryActive = withAdminMutationRefresh(
  appRouter.categories.admin.setActive.actionable(actionOptions),
  updateCategoryTags
);

export const softDeleteCategory = withAdminMutationRefresh(
  appRouter.categories.admin.softDelete.actionable(actionOptions),
  updateCategoryTags
);

export const restoreCategory = withAdminMutationRefresh(
  appRouter.categories.admin.restore.actionable(actionOptions),
  updateCategoryTags
);

export type CategoryRowActionInput =
  | { ids: string[]; type: "reorder" }
  | { id: string; type: "restore" }
  | { active: boolean; id: string; type: "setActive" }
  | { id: string; type: "softDelete" };

export async function runCategoryRowAction(input: CategoryRowActionInput) {
  switch (input.type) {
    case "reorder":
      return await reorderCategories({ ids: input.ids });
    case "restore":
      return await restoreCategory({ id: input.id });
    case "setActive":
      return await setCategoryActive({
        active: input.active,
        id: input.id,
      });
    case "softDelete":
      return await softDeleteCategory({ id: input.id });
    default:
      throw new Error("Unsupported category row action.");
  }
}
