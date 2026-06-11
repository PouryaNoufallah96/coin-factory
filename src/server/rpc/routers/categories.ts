import { listActiveCategories } from "@/features/categories/db/queries";
import { publicCategorySchema } from "@/features/categories/schemas/category";

import { publicProcedure, withIpThrottle } from "../middleware";

// Reads are cheap and cached for RSC consumers; the throttle only meters
// direct /rpc traffic.
const READ_LIMIT_PER_MINUTE = 60;
const READ_WINDOW_MS = 60_000;

const listActive = publicProcedure
  .use(withIpThrottle("categories-read", READ_LIMIT_PER_MINUTE, READ_WINDOW_MS))
  .output(publicCategorySchema.array())
  .handler(({ context }) => listActiveCategories(context.db));

export const categoriesRouter = { listActive };
