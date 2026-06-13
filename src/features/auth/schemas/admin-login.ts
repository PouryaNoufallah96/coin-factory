import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export const adminLoginActionSchema = adminLoginSchema.extend({
  redirectTo: z.string().optional(),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminLoginActionInput = z.infer<typeof adminLoginActionSchema>;
