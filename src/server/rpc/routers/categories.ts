import "server-only";

import { ORPCError } from "@orpc/server";
import { findDbError } from "@/features/admin/lib/find-db-error";
import { okOutputSchema } from "@/features/admin/schemas/ok-output";
import { revalidateCategoryTags } from "@/features/categories/db/cache/tags";
import {
  createCategory,
  listActiveCategories,
  listAdminCategories,
  reorderCategories,
  restoreCategory,
  setCategoryActive,
  softDeleteCategory,
  updateCategory,
} from "@/features/categories/db/queries";
import {
  adminCategoryListInputSchema,
  adminCategoryListOutputSchema,
  categoryIdInputSchema,
  createCategoryInputSchema,
  publicCategorySchema,
  reorderCategoriesInputSchema,
  setCategoryActiveInputSchema,
  updateCategoryInputSchema,
} from "@/features/categories/schemas/category";
import { OrderedEntitySetMismatchError } from "@/server/db/ordered-entity";

import { adminProcedure, publicProcedure, withIpThrottle } from "../middleware";

// Reads are cheap and cached for RSC consumers; the throttle only meters
// direct /rpc traffic.
const READ_LIMIT_PER_MINUTE = 60;
const READ_WINDOW_MS = 60_000;

const listActive = publicProcedure
  .use(withIpThrottle("categories-read", READ_LIMIT_PER_MINUTE, READ_WINDOW_MS))
  .output(publicCategorySchema.array())
  .handler(({ context }) => listActiveCategories(context.db));

const listAdmin = adminProcedure
  .input(adminCategoryListInputSchema)
  .output(adminCategoryListOutputSchema)
  .handler(({ context, input }) => listAdminCategories(input, context.db));

const create = adminProcedure
  .input(createCategoryInputSchema)
  .output(okOutputSchema)
  .handler(async ({ context, input }) => {
    try {
      const created = await createCategory(input, context.db);
      if (!created) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Category could not be created.",
        });
      }
      revalidateCategoryTags();
      return { ok: true as const };
    } catch (error) {
      throw mapCategoryError(error);
    }
  });

const update = adminProcedure
  .input(updateCategoryInputSchema)
  .output(okOutputSchema)
  .handler(async ({ context, input }) => {
    try {
      const updated = await updateCategory(input, context.db);
      if (!updated) {
        throw new ORPCError("NOT_FOUND", {
          message: "Category was not found.",
        });
      }
      revalidateCategoryTags(input.id);
      return { ok: true as const };
    } catch (error) {
      throw mapCategoryError(error);
    }
  });

const setActive = adminProcedure
  .input(setCategoryActiveInputSchema)
  .output(okOutputSchema)
  .handler(async ({ context, input }) => {
    const updated = await setCategoryActive(input, context.db);
    if (!updated) {
      throw new ORPCError("NOT_FOUND", {
        message: "Category was not found.",
      });
    }
    revalidateCategoryTags(input.id);
    return { ok: true as const };
  });

const softDelete = adminProcedure
  .input(categoryIdInputSchema)
  .output(okOutputSchema)
  .handler(async ({ context, input }) => {
    const deleted = await softDeleteCategory(input.id, context.db);
    if (!deleted) {
      throw new ORPCError("NOT_FOUND", {
        message: "Category was not found.",
      });
    }
    revalidateCategoryTags(input.id);
    return { ok: true as const };
  });

const restore = adminProcedure
  .input(categoryIdInputSchema)
  .output(okOutputSchema)
  .handler(async ({ context, input }) => {
    try {
      const restored = await restoreCategory(input.id, context.db);
      if (!restored) {
        throw new ORPCError("NOT_FOUND", {
          message: "Deleted category was not found.",
        });
      }
      revalidateCategoryTags(input.id);
      return { ok: true as const };
    } catch (error) {
      throw mapCategoryError(error);
    }
  });

const reorder = adminProcedure
  .input(reorderCategoriesInputSchema)
  .output(okOutputSchema)
  .handler(async ({ context, input }) => {
    try {
      await reorderCategories(input.ids, context.db);
      revalidateCategoryTags();
      return { ok: true as const };
    } catch (error) {
      if (error instanceof OrderedEntitySetMismatchError) {
        throw new ORPCError("BAD_REQUEST", { message: error.message });
      }
      throw error;
    }
  });

export const categoriesRouter = {
  admin: {
    create,
    list: listAdmin,
    reorder,
    restore,
    setActive,
    softDelete,
    update,
  },
  listActive,
};

function mapCategoryError(error: unknown): never {
  if (error instanceof ORPCError) {
    throw error;
  }

  const dbError = findDbError(error, "23505");

  if (dbError?.constraint === "categories_label_live_unique") {
    throw new ORPCError("CONFLICT", {
      message: "A live category with this label already exists.",
    });
  }

  throw error;
}
