import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

import { coinfactoryEmailTailwindConfig } from "../email-theme";
import {
  adminFileUrl,
  adminInquiryUrl,
  formatBytes,
  formatDateTime,
  type SubmissionEmailProps,
} from "../submission-email-content";

export default function SubmissionEmail({
  appBaseUrl,
  inquiry,
}: SubmissionEmailProps) {
  const inquiryUrl = adminInquiryUrl(appBaseUrl, inquiry.id);
  const categories = inquiry.categories.map((category) => category.label);

  return (
    <Html lang="en">
      <Tailwind config={coinfactoryEmailTailwindConfig}>
        <Head />
        <Body className="m-0 bg-cf-canvas px-0 py-8 font-sans text-cf-text">
          <Preview>New CoinFactory inquiry from {inquiry.email}</Preview>
          <Container className="mx-auto w-full max-w-[600px] rounded-[32px] border border-cf-border border-solid bg-cf-surface p-8">
            <Text className="m-0 font-semibold text-cf-cream text-sm">
              CoinFactory
            </Text>
            <Heading
              as="h1"
              className="mt-4 mb-3 font-semibold text-[30px] text-cf-text leading-[38px]"
            >
              New tokenization inquiry
            </Heading>
            <Text className="mt-0 mb-6 text-base text-cf-muted leading-6">
              A founder submitted a new inquiry. Review the full submission in
              the admin workspace.
            </Text>
            <Button
              className="box-border block rounded-full bg-cf-cream px-6 py-4 text-center font-semibold text-base text-cf-canvas no-underline"
              href={inquiryUrl}
            >
              View full submission
            </Button>

            <Hr className="my-8 border-cf-border border-solid" />

            <Section className="rounded-[24px] border border-cf-border border-solid bg-cf-canvas p-5">
              <SectionHeading>Contact</SectionHeading>
              <DetailLine label="Email" value={inquiry.email} />
              <DetailLine label="WhatsApp" value={inquiry.whatsapp} />
              <DetailLine
                label="Submitted"
                value={formatDateTime(inquiry.createdAt)}
              />
            </Section>

            <Section className="mt-5 rounded-[24px] border border-cf-border border-solid bg-cf-canvas p-5">
              <SectionHeading>Asset description</SectionHeading>
              <Text className="m-0 text-base text-cf-text leading-6">
                {inquiry.assetDescription || "Not provided"}
              </Text>
            </Section>

            <Section className="mt-5 rounded-[24px] border border-cf-border border-solid bg-cf-canvas p-5">
              <SectionHeading>Business categories</SectionHeading>
              <Text className="m-0 text-base text-cf-text leading-6">
                {categories.length > 0 ? categories.join(", ") : "None picked"}
              </Text>
            </Section>

            <Section className="mt-5 rounded-[24px] border border-cf-border border-solid bg-cf-canvas p-5">
              <SectionHeading>Answers</SectionHeading>
              {inquiry.answers.map((answer) => (
                <Section className="mt-4" key={answer.questionId}>
                  <Text className="m-0 font-semibold text-cf-cream text-sm leading-5">
                    {answer.questionText}
                  </Text>
                  <Text className="mt-1 mb-0 text-base text-cf-text leading-6">
                    {answer.value}
                  </Text>
                </Section>
              ))}
            </Section>

            <Section className="mt-5 rounded-[24px] border border-cf-border border-solid bg-cf-canvas p-5">
              <SectionHeading>Documents</SectionHeading>
              {inquiry.files.length > 0 ? (
                inquiry.files.map((file) => (
                  <Section className="mt-4" key={file.id}>
                    <Text className="m-0 font-semibold text-base text-cf-text leading-6">
                      {file.filename}
                    </Text>
                    <Text className="mt-0 mb-1 text-cf-muted text-sm leading-5">
                      {file.contentType} - {formatBytes(file.sizeBytes)}
                    </Text>
                    <Link
                      className="font-semibold text-cf-cream text-sm underline"
                      href={adminFileUrl(appBaseUrl, file.id)}
                    >
                      Download document
                    </Link>
                  </Section>
                ))
              ) : (
                <Text className="m-0 text-base text-cf-text leading-6">
                  No supporting documents.
                </Text>
              )}
            </Section>

            <Text className="mt-8 mb-0 text-center text-cf-muted text-xs leading-5">
              @ 2026 CoinFactory AG
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <Text className="mt-0 mb-3 font-semibold text-cf-muted text-sm">
      {children}
    </Text>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <Text className="mt-0 mb-2 text-base text-cf-text leading-6">
      <span className="text-cf-muted">{label}: </span>
      {value}
    </Text>
  );
}

SubmissionEmail.PreviewProps = {
  appBaseUrl: "http://localhost:3000",
  inquiry: {
    answers: [
      {
        questionId: "00000000-0000-0000-0000-000000000001",
        questionText: "What stage is your project currently in?",
        value: "Idea Stage",
      },
      {
        questionId: "00000000-0000-0000-0000-000000000003",
        questionText: "What is your primary goal for tokenization?",
        value: "Raise capital",
      },
    ],
    assetDescription:
      "A luxury hotel in the Swiss Alps with existing revenue, expansion plans, and a founder group exploring regulated tokenization.",
    categories: [
      {
        categoryId: "00000000-0000-0000-0000-000000000002",
        label: "Luxury Hotel",
      },
      {
        categoryId: "00000000-0000-0000-0000-000000000004",
        label: "Real Estate",
      },
    ],
    createdAt: new Date("2026-06-12T12:00:00.000Z"),
    email: "founder@example.com",
    files: [
      {
        contentType: "application/pdf",
        createdAt: new Date("2026-06-12T12:01:00.000Z"),
        filename: "investment-deck.pdf",
        id: "00000000-0000-0000-0000-000000000005",
        sizeBytes: 1_846_272,
      },
    ],
    id: "00000000-0000-0000-0000-000000000000",
    notificationAttemptedAt: null,
    notificationError: null,
    notifiedAt: null,
    status: "new",
    updatedAt: new Date("2026-06-12T12:00:00.000Z"),
    whatsapp: "+41790000000",
  },
} satisfies SubmissionEmailProps;
