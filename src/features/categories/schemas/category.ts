import { createSelectSchema } from "drizzle-orm/zod";
import type { z } from "zod";

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
