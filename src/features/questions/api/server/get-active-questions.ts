import { cacheLife, cacheTag } from "next/cache";

import { orpcServer } from "@/lib/orpc.server";

import { questionTags } from "../../db/cache/tags";

/**
 * The wizard's question list, cached once for every visitor; admin question
 * mutations refresh it through the tag. Render under a Suspense boundary.
 */
export async function getActiveQuestions() {
  "use cache";
  cacheTag(questionTags.activeList());
  cacheLife("hours");
  return await orpcServer.questions.listActive();
}
