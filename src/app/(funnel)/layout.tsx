import { preload } from "react-dom";
import { FunnelResumeGuard } from "@/features/inquiries/components/funnel-resume-guard";
import { FunnelShell } from "@/features/inquiries/components/funnel-shell";
import { FunnelDraftProvider } from "@/features/inquiries/hooks/use-funnel-draft";

export default function FunnelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preload("/brand/landing-back-mobile.svg", {
    as: "image",
    fetchPriority: "high",
    media: "(max-width: 39.99rem)",
  });
  preload("/brand/landing-back.svg", {
    as: "image",
    fetchPriority: "high",
    media: "(min-width: 40rem)",
  });
  preload("/brand/q-back.svg", { as: "image" });
  preload("/brand/thankyou-back.svg", { as: "image" });

  return (
    <>
      <FunnelResumeGuard />
      <FunnelDraftProvider>
        <FunnelShell>{children}</FunnelShell>
      </FunnelDraftProvider>
    </>
  );
}
