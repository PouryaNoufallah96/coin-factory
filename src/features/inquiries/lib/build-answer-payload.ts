import type { PublicQuestion } from "@/features/questions/schemas/question";

import type { InquirySubmission } from "../schemas/inquiry-submission";

export function buildAnswerPayload(
  questions: PublicQuestion[],
  answers: Record<string, string>
): InquirySubmission["answers"] {
  return questions.flatMap((question) => {
    if (question.kind === "contact") {
      return [];
    }

    const value = (answers[question.id] ?? "").trim();
    if (question.kind === "url" && value.length === 0) {
      return [];
    }

    return [{ questionId: question.id, value }];
  });
}
