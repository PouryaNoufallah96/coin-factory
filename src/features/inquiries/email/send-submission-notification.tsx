import "server-only";

import { env } from "@/config/env/server";
import { listNotificationRecipients } from "@/features/settings/db/queries";
import { resolveNotificationRecipients } from "@/features/settings/lib/notification-recipients";
import { resend } from "@/services/resend/client";

import {
  getSubmissionEmailSnapshot,
  setInquiryNotificationOutcome,
} from "../db/queries";
import { buildSubmissionEmailText } from "./submission-email-content";
import SubmissionEmail from "./templates/submission-email";

interface SendSubmissionNotificationOptions {
  idempotencyKey?: string;
}

export type SendSubmissionNotificationResult =
  | { ok: true }
  | { error: string; ok: false };

/**
 * Post-commit, best-effort: the stored inquiry is the source of truth, so a
 * failed send only marks the row for the admin resend action — it never
 * fails the submission. Logs carry the inquiry id and outcome only, never
 * the payload.
 */
export async function sendSubmissionNotification(
  inquiryId: string,
  options: SendSubmissionNotificationOptions = {}
): Promise<SendSubmissionNotificationResult> {
  try {
    const [inquiry, configuredRecipients] = await Promise.all([
      getSubmissionEmailSnapshot(inquiryId),
      listNotificationRecipients(),
    ]);

    if (!inquiry) {
      throw new Error("Inquiry was not found.");
    }

    const recipients = resolveNotificationRecipients(
      configuredRecipients,
      env.SUBMISSION_NOTIFICATION_EMAIL
    );
    const emailProps = {
      appBaseUrl: env.BETTER_AUTH_URL,
      inquiry,
    };
    const { error } = await resend.emails.send(
      {
        from: env.SUBMISSION_FROM_EMAIL,
        to: recipients,
        subject: "New tokenization inquiry",
        react: <SubmissionEmail {...emailProps} />,
        text: buildSubmissionEmailText(emailProps),
      },
      {
        idempotencyKey:
          options.idempotencyKey ?? `submission-email/${inquiryId}`,
      }
    );
    if (error) {
      throw new Error(error.message);
    }
  } catch (cause) {
    await recordNotificationFailure(inquiryId, cause);
    return notificationFailureResult(cause);
  }

  const now = new Date();

  try {
    await setInquiryNotificationOutcome(inquiryId, {
      notifiedAt: now,
      notificationAttemptedAt: now,
      notificationError: null,
    });
  } catch {
    console.error(
      `inquiry ${inquiryId}: could not record the notification success`
    );
  }

  console.info(`inquiry ${inquiryId}: submission email sent`);
  return { ok: true };
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

function notificationFailureResult(
  cause: unknown
): SendSubmissionNotificationResult {
  return {
    error: cause instanceof Error ? cause.message : "Unknown send failure",
    ok: false,
  };
}
