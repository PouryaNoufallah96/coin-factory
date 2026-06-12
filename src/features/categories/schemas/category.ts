import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

import {
  createAdminListInputSchema,
  createAdminListOutputSchema,
  createReorderInputSchema,
  entityIdInputSchema,
  setEntityActiveInputSchema,
} from "@/features/admin/schemas/ordered-entity-list";
import { categories } from "@/server/db/schema";

const categoryOrderBy = ["label", "sortOrder", "active", "createdAt"] as const;

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

export const adminCategoryListInputSchema =
  createAdminListInputSchema(categoryOrderBy);

export type AdminCategoryListInput = z.infer<
  typeof adminCategoryListInputSchema
>;

export const adminCategoryListOutputSchema =
  createAdminListOutputSchema(adminCategorySchema);

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

export const setCategoryActiveInputSchema = setEntityActiveInputSchema;

export const categoryIdInputSchema = entityIdInputSchema;

export const reorderCategoriesInputSchema =
  createReorderInputSchema("category");

export type CategoryFormInput = z.input<typeof createCategoryInputSchema>;
