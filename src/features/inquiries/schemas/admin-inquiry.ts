import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

import { createAdminListInputSchema } from "@/features/admin/schemas/ordered-entity-list";
import {
  inquiries,
  inquiryAnswers,
  inquiryCategories,
  inquiryFiles,
  inquiryStatuses,
} from "@/server/db/schema";

export const adminInquiryOrderBy = [
  "email",
  "assetDescription",
  "status",
  "notifiedAt",
  "createdAt",
] as const;

export const inquiryStatusSchema = z.enum(inquiryStatuses);

const inquirySchema = createSelectSchema(inquiries);
const inquiryAnswerSchema = createSelectSchema(inquiryAnswers);
const inquiryCategorySchema = createSelectSchema(inquiryCategories);
const inquiryFileSchema = createSelectSchema(inquiryFiles);

export const adminInquiryRowSchema = inquirySchema.pick({
  id: true,
  assetDescription: true,
  email: true,
  whatsapp: true,
  status: true,
  notifiedAt: true,
  notificationAttemptedAt: true,
  notificationError: true,
  createdAt: true,
  updatedAt: true,
});

export type AdminInquiry = z.infer<typeof adminInquiryRowSchema>;

export const adminInquiryAnswerSchema = inquiryAnswerSchema.pick({
  questionId: true,
  questionText: true,
  value: true,
});

export const adminInquiryCategorySchema = inquiryCategorySchema.pick({
  categoryId: true,
  label: true,
});

export const adminInquiryFileSchema = inquiryFileSchema.pick({
  id: true,
  filename: true,
  contentType: true,
  sizeBytes: true,
  createdAt: true,
});

export const adminInquiryFileDownloadSchema = inquiryFileSchema.pick({
  id: true,
  inquiryId: true,
  storageKey: true,
  filename: true,
  contentType: true,
  sizeBytes: true,
  createdAt: true,
});

export const adminInquiryDetailSchema = adminInquiryRowSchema.extend({
  answers: adminInquiryAnswerSchema.array(),
  categories: adminInquiryCategorySchema.array(),
  files: adminInquiryFileSchema.array(),
});

export type AdminInquiryDetail = z.infer<typeof adminInquiryDetailSchema>;

export const adminInquiryListInputSchema =
  createAdminListInputSchema(adminInquiryOrderBy);

export type AdminInquiryListInput = z.infer<typeof adminInquiryListInputSchema>;

export const adminInquiryListOutputSchema = z.object({
  rows: adminInquiryRowSchema.array(),
  totalRows: z.number().int().nonnegative(),
});

export const inquiryEntityIdInputSchema = z.object({
  id: z.uuid(),
});

export const setInquiryStatusInputSchema = inquiryEntityIdInputSchema.extend({
  status: inquiryStatusSchema,
});

export const resendInquiryNotificationInputSchema = inquiryEntityIdInputSchema;

export const adminInquiryRowActionInputSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.uuid(),
    status: inquiryStatusSchema,
    type: z.literal("setStatus"),
  }),
  z.object({
    id: z.uuid(),
    type: z.literal("resendNotification"),
  }),
]);

export type AdminInquiryRowActionInput = z.infer<
  typeof adminInquiryRowActionInputSchema
>;
