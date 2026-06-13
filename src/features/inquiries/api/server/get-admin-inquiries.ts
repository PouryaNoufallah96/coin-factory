import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { idTag } from "@/lib/cache-tags";
import { inquiryTags } from "../../db/cache/tags";
import { getAdminInquiryDetail, listAdminInquiries } from "../../db/queries";
import {
  type AdminInquiryListInput,
  adminInquiryDetailSchema,
  adminInquiryListInputSchema,
  adminInquiryListOutputSchema,
  inquiryEntityIdInputSchema,
} from "../../schemas/admin-inquiry";

export async function getAdminInquiries(input: AdminInquiryListInput) {
  "use cache";
  cacheTag(inquiryTags.adminList());
  cacheLife("hours");
  const parsedInput = adminInquiryListInputSchema.parse(input);
  const data = adminInquiryListOutputSchema.parse(
    await listAdminInquiries(parsedInput)
  );

  for (const row of data.rows) {
    cacheTag(idTag("inquiry", row.id));
  }

  return data;
}

export async function getAdminInquiry(id: string) {
  "use cache";
  const parsedInput = inquiryEntityIdInputSchema.safeParse({ id });

  if (!parsedInput.success) {
    return null;
  }

  cacheTag(idTag("inquiry", parsedInput.data.id));
  cacheLife("hours");

  const detail = await getAdminInquiryDetail(parsedInput.data.id);

  if (!detail) {
    return null;
  }

  for (const answer of detail.answers) {
    cacheTag(idTag("question", answer.questionId));
  }

  for (const category of detail.categories) {
    cacheTag(idTag("category", category.categoryId));
  }

  return adminInquiryDetailSchema.parse(detail);
}
