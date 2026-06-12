import "server-only";

import { revalidateTag, updateTag } from "next/cache";

import { globalTag } from "@/lib/cache-tags";

export const questionTags = {
  /** Tag carried by every cached active-question read; admin question mutations invalidate it. */
  activeList: () => globalTag("question"),
};

export function updateQuestionTags() {
  updateTag(questionTags.activeList());
}

export function revalidateQuestionTags() {
  revalidateTag(questionTags.activeList(), "max");
}
