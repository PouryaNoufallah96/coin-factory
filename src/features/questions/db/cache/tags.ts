import { globalTag } from "@/lib/cache-tags";

export const questionTags = {
  /** Tag carried by every cached active-question read; admin question mutations invalidate it. */
  activeList: () => globalTag("question"),
};
