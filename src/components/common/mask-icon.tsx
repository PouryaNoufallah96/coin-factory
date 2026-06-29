import type { ComponentPropsWithoutRef, CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface MaskIconProps extends ComponentPropsWithoutRef<"span"> {
  src: string;
}

function maskSrc(url: string) {
  return `url("${url.replace(/"/g, '\\"')}")`;
}

export function MaskIcon({
  src,
  className,
  style,
  "aria-hidden": ariaHidden,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: MaskIconProps) {
  const isDecorative =
    ariaHidden !== false && ariaLabel == null && ariaLabelledBy == null;

  return (
    <span
      aria-hidden={isDecorative ? true : ariaHidden}
      className={cn("cf-mask-icon", className)}
      data-slot="mask-icon"
      style={
        {
          "--cf-mask-src": maskSrc(src),
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  );
}
