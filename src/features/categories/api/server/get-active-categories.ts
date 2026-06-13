import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { orpcServer } from "@/lib/orpc.server";

import { categoryTags } from "../../db/cache/tags";

/**
 * The landing's business-category badges, cached once for every visitor;
 * admin category mutations refresh it through the tag. Render in the smallest
 * UI boundary that owns category loading; the landing uses a chip-row Suspense.
 */
export async function getActiveCategories() {
  "use cache";
  cacheTag(categoryTags.activeList());
  cacheLife("hours");
  return await orpcServer.categories.listActive();
}
