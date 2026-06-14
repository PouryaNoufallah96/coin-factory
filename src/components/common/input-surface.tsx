import type * as React from "react";

import { cn } from "@/lib/utils";

interface InputSurfaceProps extends React.ComponentProps<"div"> {
  active?: boolean;
}

export function InputSurface({
  active,
  className,
  ...props
}: InputSurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-(--cf-radius-row) bg-cf-charcoal-900 duration-(--cf-dur-content) ease-(--cf-ease)",
        className
      )}
      style={{
        border: "1px solid transparent",
        background:
          "linear-gradient(var(--color-cf-charcoal-900), var(--color-cf-charcoal-900)) padding-box, linear-gradient(90deg, #FFF2D1 0%, #28303F 100%) border-box",
        boxShadow: "0px 0px 200px 0px #FFFAED3D",
      }}
      {...props}
    />
  );
}
