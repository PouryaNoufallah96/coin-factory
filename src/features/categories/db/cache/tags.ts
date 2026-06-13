import "server-only";

import { revalidateTag, updateTag } from "next/cache";

import { globalTag, idTag } from "@/lib/cache-tags";

export const categoryTags = {
  /** Tag carried by every cached active-category read; admin category mutations invalidate it. */
  activeList: () => globalTag("category"),
  /** Tag carried by every cached admin category list read. */
  adminList: () => `${globalTag("category")}:admin` as const,
};

function fanOutCategoryTags(id?: string) {
  updateTag(categoryTags.activeList());
  updateTag(categoryTags.adminList());

  if (id) {
    updateTag(idTag("category", id));
  }
}

function revalidateCategoryTagFanOut(id?: string) {
  revalidateTag(categoryTags.activeList(), "max");
  revalidateTag(categoryTags.adminList(), "max");

  if (id) {
    revalidateTag(idTag("category", id), "max");
  }
}

export function updateCategoryTags(id?: string) {
  fanOutCategoryTags(id);
}

export function revalidateCategoryTags(id?: string) {
  revalidateCategoryTagFanOut(id);
}
