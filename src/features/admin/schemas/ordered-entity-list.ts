import { z } from "zod";

export function createAdminListInputSchema<
  T extends readonly [string, ...string[]],
>(orderByValues: T) {
  return z.object({
    orderBy: z.enum(orderByValues).or(z.literal("")),
    orderDirection: z.enum(["asc", "desc"]),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive().max(100),
    search: z.string(),
    showDeleted: z.boolean(),
  });
}

export function createAdminListOutputSchema<TRow extends z.ZodTypeAny>(
  rowSchema: TRow
) {
  return z.object({
    orderedIds: z.uuid().array(),
    rows: rowSchema.array(),
    totalRows: z.number().int().nonnegative(),
  });
}

export const setEntityActiveInputSchema = z.object({
  active: z.boolean(),
  id: z.uuid(),
});

export const entityIdInputSchema = z.object({
  id: z.uuid(),
});

export function createReorderInputSchema(entityLabel: string) {
  return z.object({
    ids: z
      .uuid()
      .array()
      .min(1, `Send the complete ordered ${entityLabel} list.`),
  });
}
