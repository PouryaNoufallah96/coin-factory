import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = {
  id: uuid().primaryKey().defaultRandom(),
};

export const createdAt = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
};

export const timestamps = {
  ...createdAt,
  // App-level bump (no DB trigger): raw SQL writes bypass it on purpose.
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const softDelete = {
  deletedAt: timestamp({ withTimezone: true }),
};
