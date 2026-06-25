import { Badge } from "@/components/ui/badge";
import { inquiryStatusLabels } from "@/features/inquiries/lib/status";
import type { AdminInquiry } from "@/features/inquiries/schemas/admin-inquiry";
import { cn } from "@/lib/utils";

interface InquiryStatusBadgeProps {
  status: AdminInquiry["status"];
}

export function InquiryStatusBadge({ status }: InquiryStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "whitespace-nowrap border-cf-cream/30 text-cf-cream/70",
        status === "new" && "border-cf-cream bg-cf-cream/10 text-cf-cream",
        status === "reviewed" && "text-cf-cream/85",
        status === "contacted" && "text-cf-cream/55",
        status === "closed" && "border-cf-border-muted text-cf-text-muted"
      )}
      variant="outline"
    >
      {inquiryStatusLabels[status]}
    </Badge>
  );
}
