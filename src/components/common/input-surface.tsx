import type * as React from "react";

import { cn } from "@/lib/utils";

interface InputSurfaceProps extends React.ComponentProps<"div"> {
  active?: boolean;
}

export function InputSurface({
  active,
  className,
  style,
  ...props
}: InputSurfaceProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col justify-center rounded-(--cf-radius-row) bg-cf-charcoal-900 text-cf-cream transition-[border-radius,padding,min-height] duration-(--cf-dur-content) ease-(--cf-ease)",
        className
      )}
      style={{
        border: "1px solid transparent",
        background:
          "linear-gradient(var(--color-cf-charcoal-900), var(--color-cf-charcoal-900)) padding-box, linear-gradient(90deg, var(--color-cf-cream) 0%, var(--color-cf-charcoal-900) 100%) border-box",
        boxShadow: "var(--cf-glow-active)",
        ...style,
      }}
      {...props}
    />
  );
}
