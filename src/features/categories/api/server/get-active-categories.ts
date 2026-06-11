import { cacheLife, cacheTag } from "next/cache";

import { orpcServer } from "@/lib/orpc.server";

import { categoryTags } from "../../db/cache/tags";

/**
 * The landing's business-category badges, cached once for every visitor;
 * admin category mutations refresh it through the tag. Render under a
 * Suspense boundary.
 */
export async function getActiveCategories() {
  "use cache";
  cacheTag(categoryTags.activeList());
  cacheLife("hours");
  return await orpcServer.categories.listActive();
}
