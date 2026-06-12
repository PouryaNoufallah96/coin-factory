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
        "whitespace-nowrap",
        status === "new" && "border-cf-cream/50 text-cf-cream",
        status === "closed" && "text-cf-text-muted"
      )}
      variant={status === "new" ? "outline" : "secondary"}
    >
      {inquiryStatusLabels[status]}
    </Badge>
  );
}
