import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter an email address.")
  .max(254, "Keep the email address under 254 characters.")
  .pipe(z.email("Enter a valid email address."));
