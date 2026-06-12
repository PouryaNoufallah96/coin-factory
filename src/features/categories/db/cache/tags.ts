import "server-only";

import { revalidateTag, updateTag } from "next/cache";

import { globalTag } from "@/lib/cache-tags";

export const categoryTags = {
  /** Tag carried by every cached active-category read; admin category mutations invalidate it. */
  activeList: () => globalTag("category"),
};

export function updateCategoryTags() {
  updateTag(categoryTags.activeList());
}

export function revalidateCategoryTags() {
  revalidateTag(categoryTags.activeList(), "max");
}
