import "server-only";

import { revalidateTag, updateTag } from "next/cache";

import { globalTag, idTag } from "@/lib/cache-tags";

export const questionTags = {
  /** Tag carried by every cached active-question read; admin question mutations invalidate it. */
  activeList: () => globalTag("question"),
  /** Tag carried by every cached admin question list read. */
  adminList: () => `${globalTag("question")}:admin` as const,
};

function fanOutQuestionTags(id?: string) {
  updateTag(questionTags.activeList());
  updateTag(questionTags.adminList());

  if (id) {
    updateTag(idTag("question", id));
  }
}

function revalidateQuestionTagFanOut(id?: string) {
  revalidateTag(questionTags.activeList(), "max");
  revalidateTag(questionTags.adminList(), "max");

  if (id) {
    revalidateTag(idTag("question", id), "max");
  }
}

export function updateQuestionTags(id?: string) {
  fanOutQuestionTags(id);
}

export function revalidateQuestionTags(id?: string) {
  revalidateQuestionTagFanOut(id);
}
