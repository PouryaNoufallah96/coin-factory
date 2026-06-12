import { cn } from "@/lib/utils";

interface FunnelSpotlightProps {
  className?: string;
}

export function FunnelSpotlight({ className }: FunnelSpotlightProps) {
  return <div aria-hidden="true" className={cn("cf-spotlight", className)} />;
}
