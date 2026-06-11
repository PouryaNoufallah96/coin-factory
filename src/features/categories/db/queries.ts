import { asc } from "drizzle-orm";

import { type DbExecutor, db } from "@/server/db";
import { whereLive } from "@/server/db/filters";
import { categories } from "@/server/db/schema";

export function listActiveCategories(executor: DbExecutor = db) {
  return executor
    .select()
    .from(categories)
    .where(whereLive(categories))
    .orderBy(asc(categories.sortOrder));
}
