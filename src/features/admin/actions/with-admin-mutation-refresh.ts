import "server-only";

import { refresh } from "next/cache";

type ActionResult = readonly [unknown, unknown];

export function withAdminMutationRefresh<TInput, TResult extends ActionResult>(
  action: (input: TInput) => Promise<TResult>,
  updateTags: (input: TInput) => void
) {
  return async (input: TInput): Promise<TResult> => {
    const result = await action(input);

    if (!result[0]) {
      updateTags(input);
      refresh();
    }

    return result;
  };
}
