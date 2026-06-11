import { asc } from "drizzle-orm";

import { type DbExecutor, db } from "@/server/db";
import { whereLive } from "@/server/db/filters";
import { questions } from "@/server/db/schema";

export function listActiveQuestions(executor: DbExecutor = db) {
  return executor
    .select()
    .from(questions)
    .where(whereLive(questions))
    .orderBy(asc(questions.sortOrder));
}
