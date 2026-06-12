import "server-only";

import { createRequestOrpcServer } from "@/lib/orpc.server";

import type { AdminCategoryListInput } from "../../schemas/category";

export async function getAdminCategories(input: AdminCategoryListInput) {
  const orpc = await createRequestOrpcServer();

  return await orpc.categories.admin.list(input);
}
