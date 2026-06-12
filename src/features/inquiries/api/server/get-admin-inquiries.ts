import "server-only";

import {
  getAdminInquiryDetail,
  listAdminInquiries,
} from "@/features/inquiries/db/queries";
import {
  type AdminInquiryListInput,
  adminInquiryDetailSchema,
  adminInquiryListInputSchema,
  adminInquiryListOutputSchema,
} from "@/features/inquiries/schemas/admin-inquiry";

export async function getAdminInquiries(input: AdminInquiryListInput) {
  const parsedInput = adminInquiryListInputSchema.parse(input);
  return adminInquiryListOutputSchema.parse(
    await listAdminInquiries(parsedInput)
  );
}

export async function getAdminInquiry(id: string) {
  const detail = await getAdminInquiryDetail(id);
  return detail ? adminInquiryDetailSchema.parse(detail) : null;
}
