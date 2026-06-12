import { z } from "zod";

export const emailSchema = z.email("Enter a valid email address.");

export const whatsappSchema = z
  .string()
  .regex(/^\+?\d{7,15}$/, "Enter a WhatsApp number with 7 to 15 digits.");
