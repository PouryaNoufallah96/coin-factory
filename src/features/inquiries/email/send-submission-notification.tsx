import "server-only";

import { env } from "@/config/env/server";

import { setInquiryNotificationOutcome } from "../db/queries";
import { resend } from "./resend";
import SubmissionEmail from "./templates/submission-email";

/**
 * Post-commit, best-effort: the stored inquiry is the source of truth, so a
 * failed send only marks the row for the admin resend action — it never
 * fails the submission. Logs carry the inquiry id and outcome only, never
 * the payload.
 */
export async function sendSubmissionNotification(
  inquiryId: string
): Promise<void> {
  try {
    const { error } = await resend.emails.send(
      {
        from: env.SUBMISSION_FROM_EMAIL,
        to: env.SUBMISSION_NOTIFICATION_EMAIL,
        subject: "New tokenization inquiry",
        react: <SubmissionEmail inquiryId={inquiryId} />,
      },
      { idempotencyKey: `submission-email/${inquiryId}` }
    );
    if (error) {
      throw new Error(error.message);
    }
    const now = new Date();
    await setInquiryNotificationOutcome(inquiryId, {
      notifiedAt: now,
      notificationAttemptedAt: now,
      notificationError: null,
    });
    console.info(`inquiry ${inquiryId}: submission email sent`);
  } catch (cause) {
    await recordNotificationFailure(inquiryId, cause);
  }
}

async function recordNotificationFailure(
  inquiryId: string,
  cause: unknown
): Promise<void> {
  console.error(`inquiry ${inquiryId}: submission email failed`);
  const message =
    cause instanceof Error ? cause.message : "Unknown send failure";
  try {
    await setInquiryNotificationOutcome(inquiryId, {
      notifiedAt: null,
      notificationAttemptedAt: new Date(),
      notificationError: message,
    });
  } catch {
    console.error(
      `inquiry ${inquiryId}: could not record the notification failure`
    );
  }
}
