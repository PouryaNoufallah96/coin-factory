import "server-only";

import { asc, count, eq, sql } from "drizzle-orm";

import { type DbExecutor, db } from "@/server/db";
import { notificationRecipients } from "@/server/db/schema";

export type NotificationRecipientInsert =
  typeof notificationRecipients.$inferInsert;

export function listNotificationRecipients(executor: DbExecutor = db) {
  return executor
    .select({
      id: notificationRecipients.id,
      email: notificationRecipients.email,
      createdAt: notificationRecipients.createdAt,
    })
    .from(notificationRecipients)
    .orderBy(
      asc(notificationRecipients.createdAt),
      asc(notificationRecipients.email)
    );
}

export async function countNotificationRecipients(
  executor: DbExecutor = db
): Promise<number> {
  const [row] = await executor
    .select({ totalRows: count() })
    .from(notificationRecipients);

  return row?.totalRows ?? 0;
}

export async function insertNotificationRecipient(
  values: Pick<NotificationRecipientInsert, "email">,
  executor: DbExecutor = db
) {
  const [created] = await executor
    .insert(notificationRecipients)
    .values(values)
    .returning({
      id: notificationRecipients.id,
      email: notificationRecipients.email,
      createdAt: notificationRecipients.createdAt,
    });

  return created ?? null;
}

export async function deleteNotificationRecipient(
  id: string,
  executor: DbExecutor = db
) {
  const [deleted] = await executor
    .delete(notificationRecipients)
    .where(eq(notificationRecipients.id, id))
    .returning({
      id: notificationRecipients.id,
      email: notificationRecipients.email,
      createdAt: notificationRecipients.createdAt,
    });

  return deleted ?? null;
}

export function lockNotificationRecipientAdds(executor: DbExecutor) {
  return executor.execute(sql`select pg_advisory_xact_lock(841337011)`);
}
