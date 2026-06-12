import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { idTag } from "@/lib/cache-tags";
import { categoryTags } from "../../db/cache/tags";
import { listAdminCategories } from "../../db/queries";
import {
  type AdminCategoryListInput,
  adminCategoryListInputSchema,
  adminCategoryListOutputSchema,
} from "../../schemas/category";

export async function getAdminCategories(input: AdminCategoryListInput) {
  "use cache";
  cacheTag(categoryTags.adminList());
  cacheLife("hours");
  const parsedInput = adminCategoryListInputSchema.parse(input);
  const data = adminCategoryListOutputSchema.parse(
    await listAdminCategories(parsedInput)
  );

  for (const row of data.rows) {
    cacheTag(idTag("category", row.id));
  }

  return data;
}
