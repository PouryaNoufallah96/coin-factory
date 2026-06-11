import { FunnelShell } from "@/features/inquiries/components/funnel-shell";
import { FunnelDraftProvider } from "@/features/inquiries/hooks/use-funnel-draft";

export default function FunnelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FunnelDraftProvider>
      <FunnelShell>{children}</FunnelShell>
    </FunnelDraftProvider>
  );
}
