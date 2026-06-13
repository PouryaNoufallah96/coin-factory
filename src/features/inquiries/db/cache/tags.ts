import "server-only";

import { revalidateTag, updateTag } from "next/cache";

import { globalTag, idTag } from "@/lib/cache-tags";

export const inquiryTags = {
  /** Tag carried by every cached admin inquiry list read. */
  adminList: () => `${globalTag("inquiry")}:admin` as const,
};

function fanOutInquiryTags(id?: string) {
  updateTag(inquiryTags.adminList());

  if (id) {
    updateTag(idTag("inquiry", id));
  }
}

function revalidateInquiryTagFanOut(id?: string) {
  revalidateTag(inquiryTags.adminList(), "max");

  if (id) {
    revalidateTag(idTag("inquiry", id), "max");
  }
}

export function updateInquiryTags(id?: string) {
  fanOutInquiryTags(id);
}

export function revalidateInquiryTags(id?: string) {
  revalidateInquiryTagFanOut(id);
}
