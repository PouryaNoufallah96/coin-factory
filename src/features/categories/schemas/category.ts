import { createSelectSchema } from "drizzle-orm/zod";
import type { z } from "zod";

import { categories } from "@/server/db/schema";

export const categorySchema = createSelectSchema(categories);

export type Category = z.infer<typeof categorySchema>;
