import { createInsertSchema } from "drizzle-orm/zod";
import { z } from "zod";

import { inquiries, inquiryAnswers } from "@/server/db/schema";

import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_CATEGORIES_PER_INQUIRY,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES,
} from "./file-constraints";
import { hasIntakeSignal, INTAKE_SIGNAL_MESSAGE } from "./intake-signal";

export const emailSchema = z.email("Enter a valid email address.");

export const whatsappSchema = z
  .string()
  .regex(/^\+?\d{7,15}$/, "Enter a WhatsApp number with 7 to 15 digits.");

const inquiryInsertSchema = createInsertSchema(inquiries, {
  email: emailSchema,
  whatsapp: whatsappSchema,
});

// Only radio and non-empty url answers become rows — contact values live on
// the inquiry itself, and per-question option membership is checked against
// the loaded questions at submit time.
export const inquiryAnswerEntrySchema = createInsertSchema(inquiryAnswers, {
  value: (schema) => schema.trim().min(1),
}).pick({ questionId: true, value: true });

export const supportingDocumentSchema = z
  .file()
  .max(MAX_FILE_SIZE_BYTES)
  .mime([...ALLOWED_DOCUMENT_MIME_TYPES]);

export const inquirySubmissionSchema = inquiryInsertSchema
  .pick({ assetDescription: true, email: true, whatsapp: true })
  .extend({
    answers: inquiryAnswerEntrySchema.array(),
    files: supportingDocumentSchema.array().max(MAX_FILES),
    categoryIds: z.uuid().array().max(MAX_CATEGORIES_PER_INQUIRY),
    // Honeypot — hidden from humans; any non-empty value marks the submit as spam.
    company: z.literal(""),
  })
  .refine(hasIntakeSignal, INTAKE_SIGNAL_MESSAGE);

export type InquirySubmission = z.infer<typeof inquirySubmissionSchema>;
