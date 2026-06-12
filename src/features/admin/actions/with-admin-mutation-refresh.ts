import "server-only";

import { refresh } from "next/cache";

type ActionResult = readonly [unknown, unknown];

export function withAdminMutationRefresh<
  TArgs extends unknown[],
  TResult extends ActionResult,
>(action: (...args: TArgs) => Promise<TResult>, updateTags: () => void) {
  return async (...args: TArgs): Promise<TResult> => {
    const result = await action(...args);

    if (!result[0]) {
      updateTags();
      refresh();
    }

    return result;
  };
}
