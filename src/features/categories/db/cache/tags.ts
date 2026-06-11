import { globalTag } from "@/lib/cache-tags";

export const categoryTags = {
  /** Tag carried by every cached active-category read; admin category mutations invalidate it. */
  activeList: () => globalTag("category"),
};
