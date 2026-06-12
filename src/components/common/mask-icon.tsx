import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface MaskIconProps {
  className?: string;
  src: string;
}

export function MaskIcon({ className, src }: MaskIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("block bg-current", className)}
      data-slot="mask-icon"
      style={
        {
          WebkitMask: `url("${src}") center / contain no-repeat`,
          mask: `url("${src}") center / contain no-repeat`,
        } satisfies CSSProperties
      }
    />
  );
}
