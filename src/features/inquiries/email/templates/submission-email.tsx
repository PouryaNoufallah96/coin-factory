import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "react-email";

import type { AdminInquiryDetail } from "@/features/inquiries/schemas/admin-inquiry";

interface SubmissionEmailProps {
  inquiry: AdminInquiryDetail;
}

export default function SubmissionEmail({ inquiry }: SubmissionEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body>
        <Preview>New tokenization inquiry received</Preview>
        <Container>
          <Heading as="h1">New tokenization inquiry</Heading>
          <Text>Inquiry {inquiry.id} is ready for review.</Text>
          <Text>Email: {inquiry.email}</Text>
          <Text>WhatsApp: {inquiry.whatsapp}</Text>
          {inquiry.assetDescription ? (
            <Text>Asset: {inquiry.assetDescription}</Text>
          ) : null}
          {inquiry.categories.length > 0 ? (
            <Text>
              Categories:{" "}
              {inquiry.categories.map((category) => category.label).join(", ")}
            </Text>
          ) : null}
          {inquiry.answers.map((answer) => (
            <Text key={answer.questionId}>
              {answer.questionText}: {answer.value}
            </Text>
          ))}
        </Container>
      </Body>
    </Html>
  );
}

SubmissionEmail.PreviewProps = {
  inquiry: {
    answers: [
      {
        questionId: "00000000-0000-0000-0000-000000000001",
        questionText: "What stage is your project currently in?",
        value: "Idea Stage",
      },
    ],
    assetDescription: "Tokenized real estate fund",
    categories: [
      {
        categoryId: "00000000-0000-0000-0000-000000000002",
        label: "Real Estate",
      },
    ],
    createdAt: new Date("2026-06-12T12:00:00.000Z"),
    email: "founder@example.com",
    files: [],
    id: "00000000-0000-0000-0000-000000000000",
    notificationAttemptedAt: null,
    notificationError: null,
    notifiedAt: null,
    status: "new",
    updatedAt: new Date("2026-06-12T12:00:00.000Z"),
    whatsapp: "+41790000000",
  },
} satisfies SubmissionEmailProps;
