import "server-only";

import { ORPCError } from "@orpc/server";
import { z } from "zod";

import {
  type InquiryAnswerInsert,
  type InquiryFileInsert,
  insertInquiry,
  insertInquiryAnswers,
  insertInquiryCategoryPicks,
  insertInquiryFiles,
} from "@/features/inquiries/db/queries";
import { sendSubmissionNotification } from "@/features/inquiries/email/send-submission-notification";
import { matchesClaimedDocumentType } from "@/features/inquiries/lib/document-sniff";
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  type AllowedDocumentMimeType,
  DOCUMENT_EXTENSION_BY_MIME,
} from "@/features/inquiries/schemas/file-constraints";
import {
  type InquirySubmission,
  inquirySubmissionSchema,
} from "@/features/inquiries/schemas/inquiry-submission";
import { REQUIRED_ANSWER_MESSAGE } from "@/features/inquiries/schemas/validation-messages";
import { listActiveQuestions } from "@/features/questions/db/queries";
import {
  type Question,
  questionAnswerValueSchema,
} from "@/features/questions/schemas/question";
import { getStorage } from "@/services/storage";

import { payloadQuota, publicProcedure, withIpThrottle } from "../middleware";

// Generous for a human retrying a failed submit, hostile to volume abuse.
const CREATE_LIMIT_PER_MINUTE = 5;
const CREATE_WINDOW_MS = 60_000;

const create = publicProcedure
  .use(
    withIpThrottle(
      "inquiries-create",
      CREATE_LIMIT_PER_MINUTE,
      CREATE_WINDOW_MS
    )
  )
  .use(payloadQuota)
  .input(inquirySubmissionSchema)
  .output(z.object({ id: z.uuid() }))
  .handler(async ({ input, context }) => {
    const inquiryId = crypto.randomUUID();
    const activeQuestions = await listActiveQuestions(context.db);
    const answerRows = buildAnswerRows(
      inquiryId,
      input.answers,
      activeQuestions
    );
    const categoryIds = [...new Set(input.categoryIds)];
    const documents = await sniffSupportingDocuments(input.files);

    const uploads = documents.map((document) => {
      const fileId = crypto.randomUUID();
      const extension = DOCUMENT_EXTENSION_BY_MIME[document.contentType];
      const row: InquiryFileInsert = {
        id: fileId,
        inquiryId,
        // Opaque key — the user's filename stays display metadata only.
        storageKey: `inquiries/${inquiryId}/${fileId}${extension}`,
        filename: document.file.name,
        contentType: document.contentType,
        sizeBytes: document.bytes.byteLength,
      };
      return { ...document, row };
    });
    const fileRows = uploads.map((upload) => upload.row);

    await uploadSupportingDocuments(uploads);

    try {
      await context.db.transaction(async (tx) => {
        await insertInquiry(
          {
            id: inquiryId,
            assetDescription: normalizedDescription(input.assetDescription),
            email: input.email,
            whatsapp: input.whatsapp,
          },
          tx
        );
        await insertInquiryAnswers(answerRows, tx);
        const insertedPicks = await insertInquiryCategoryPicks(
          inquiryId,
          categoryIds,
          tx
        );
        if (insertedPicks !== categoryIds.length) {
          throw new ORPCError("BAD_REQUEST", {
            message:
              "A selected category is no longer available. Please refresh and try again.",
          });
        }
        await insertInquiryFiles(fileRows, tx);
      });
    } catch (error) {
      await deleteUploadedObjects(fileRows.map((row) => row.storageKey));
      if (error instanceof ORPCError) {
        throw error;
      }
      console.error(`inquiry ${inquiryId}: submission transaction failed`);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "We could not save your inquiry. Please try again.",
      });
    }

    await sendSubmissionNotification(inquiryId);

    return { id: inquiryId };
  });

export const inquiriesRouter = { create };

function normalizedDescription(assetDescription: string | null | undefined) {
  const trimmed = assetDescription?.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed;
}

function buildAnswerRows(
  inquiryId: string,
  answers: InquirySubmission["answers"],
  activeQuestions: Question[]
): InquiryAnswerInsert[] {
  const questionsById = new Map(
    activeQuestions.map((question) => [question.id, question])
  );
  const seen = new Set<string>();
  const rows: InquiryAnswerInsert[] = [];

  for (const answer of answers) {
    const question = questionsById.get(answer.questionId);
    if (!question || question.kind === "contact") {
      throw new ORPCError("BAD_REQUEST", {
        message:
          "An answer references a question that is not part of the current form.",
      });
    }
    if (seen.has(question.id)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "The submission answers the same question twice.",
      });
    }
    seen.add(question.id);
    const value = questionAnswerValueSchema(question).safeParse(answer.value);
    if (!value.success) {
      throw new ORPCError("BAD_REQUEST", {
        message: `The answer to "${question.text}" is not valid.`,
      });
    }
    if (question.kind === "url" && value.data === "") {
      continue;
    }
    rows.push({
      inquiryId,
      questionId: question.id,
      value: value.data,
      // Snapshot at submit time — admin edits never rewrite what was asked.
      questionText: question.text,
    });
  }

  const missingRequiredAnswer = activeQuestions.some(
    (question) => question.kind === "radio" && !seen.has(question.id)
  );
  if (missingRequiredAnswer) {
    throw new ORPCError("BAD_REQUEST", {
      message: REQUIRED_ANSWER_MESSAGE,
    });
  }

  return rows;
}

interface SupportingDocument {
  bytes: Uint8Array;
  contentType: AllowedDocumentMimeType;
  file: File;
}

/**
 * Magic-byte verification before any byte is stored: the claimed MIME type,
 * the filename extension, and the sniffed document structure must agree —
 * extension and client MIME alone are spoofable.
 */
function sniffSupportingDocuments(
  files: InquirySubmission["files"]
): Promise<SupportingDocument[]> {
  return Promise.all(
    files.map(async (file) => {
      const contentType = ALLOWED_DOCUMENT_MIME_TYPES.find(
        (mime) => mime === file.type
      );
      if (!contentType) {
        throw new ORPCError("BAD_REQUEST", {
          message: `"${file.name}" is not a PDF or Word document.`,
        });
      }
      const extension = DOCUMENT_EXTENSION_BY_MIME[contentType];
      if (!file.name.toLowerCase().endsWith(extension)) {
        throw new ORPCError("BAD_REQUEST", {
          message: `"${file.name}" does not match its declared file type.`,
        });
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!matchesClaimedDocumentType(bytes, contentType)) {
        throw new ORPCError("BAD_REQUEST", {
          message: `"${file.name}" could not be verified as the document type it declares.`,
        });
      }
      return { bytes, contentType, file };
    })
  );
}

/**
 * Storage writes stay OUTSIDE the DB transaction (object storage cannot roll
 * back): track every uploaded key and delete them all when a later upload —
 * or the transaction — fails, so partial failures never leak orphans.
 */
async function uploadSupportingDocuments(
  uploads: Array<SupportingDocument & { row: InquiryFileInsert }>
): Promise<void> {
  const storage = getStorage();
  const uploadedKeys: string[] = [];
  for (const upload of uploads) {
    try {
      await storage.put(
        upload.row.storageKey,
        upload.bytes,
        upload.contentType
      );
      uploadedKeys.push(upload.row.storageKey);
    } catch {
      await deleteUploadedObjects(uploadedKeys);
      console.error("inquiries.create: supporting-document upload failed");
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "We could not store your documents. Please try again.",
      });
    }
  }
}

async function deleteUploadedObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) {
    return;
  }
  try {
    await getStorage().delete(keys);
  } catch {
    // Manual-sweep breadcrumb — keys are opaque, never PII.
    console.error(
      `inquiries.create: orphaned storage objects need manual cleanup: ${keys.join(", ")}`
    );
  }
}
