import { z } from "zod";

import { emailSchema as sharedEmailSchema } from "@/lib/schemas/email";

export const emailSchema = sharedEmailSchema;

export const whatsappSchema = z
  .string()
  .regex(/^\+?\d{7,15}$/, "Enter a WhatsApp number with 7 to 15 digits.");

export function sanitizePhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const hasPlus = raw.trimStart().startsWith("+");
  return hasPlus ? `+${digits}` : digits;
}
