import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

import { categories } from "@/server/db/schema";

export const categorySchema = createSelectSchema(categories);

export type Category = z.infer<typeof categorySchema>;

/** What the landing is allowed to see — admin lifecycle columns stay server-side. */
export const publicCategorySchema = categorySchema.pick({
  id: true,
  sortOrder: true,
  label: true,
});

export type PublicCategory = z.infer<typeof publicCategorySchema>;

export const adminCategorySchema = categorySchema.pick({
  id: true,
  label: true,
  sortOrder: true,
  active: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type AdminCategory = z.infer<typeof adminCategorySchema>;

export const adminCategoryListInputSchema = z.object({
  search: z.string(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().max(100),
  orderBy: z
    .enum(["label", "sortOrder", "active", "createdAt"])
    .or(z.literal("")),
  orderDirection: z.enum(["asc", "desc"]),
  showDeleted: z.boolean(),
});

export type AdminCategoryListInput = z.infer<
  typeof adminCategoryListInputSchema
>;

export const adminCategoryListOutputSchema = z.object({
  orderedIds: z.uuid().array(),
  rows: adminCategorySchema.array(),
  totalRows: z.number().int().nonnegative(),
});

const categoryLabelSchema = z
  .string()
  .trim()
  .min(1, "Enter a category label.")
  .max(80, "Keep the category label under 80 characters.");

export const createCategoryInputSchema = z.object({
  label: categoryLabelSchema,
});

export const updateCategoryInputSchema = createCategoryInputSchema.extend({
  id: z.uuid(),
});

export const setCategoryActiveInputSchema = z.object({
  active: z.boolean(),
  id: z.uuid(),
});

export const categoryIdInputSchema = z.object({
  id: z.uuid(),
});

export const reorderCategoriesInputSchema = z.object({
  ids: z.uuid().array().min(1, "Send the complete ordered category list."),
});

export type CategoryFormInput = z.input<typeof createCategoryInputSchema>;
