import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "react-email";

interface SubmissionEmailProps {
  inquiryId: string;
}

export default function SubmissionEmail({ inquiryId }: SubmissionEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body>
        <Preview>New tokenization inquiry received</Preview>
        <Container>
          <Heading as="h1">New tokenization inquiry</Heading>
          <Text>Inquiry {inquiryId} is ready for review.</Text>
        </Container>
      </Body>
    </Html>
  );
}

SubmissionEmail.PreviewProps = {
  inquiryId: "00000000-0000-0000-0000-000000000000",
} satisfies SubmissionEmailProps;
