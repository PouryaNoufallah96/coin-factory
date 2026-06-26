import type * as React from "react";

import { cn } from "@/lib/utils";

type InputSurfaceVariant = "search" | "field";

interface InputSurfaceProps extends React.ComponentProps<"div"> {
  filled?: boolean;
  focused?: boolean;
  variant?: InputSurfaceVariant;
}

function borderClass(active: boolean, variant: InputSurfaceVariant) {
  if (active) {
    return "border-cf-border-active";
  }
  return variant === "search" ? "border-transparent" : "border-cf-border-muted";
}

function glowClass(
  focused: boolean,
  active: boolean,
  variant: InputSurfaceVariant
) {
  if (variant === "search") {
    return active ? "shadow-(--cf-glow-active)" : "shadow-(--cf-glow-soft)";
  }
  return focused ? "shadow-(--cf-glow-active)" : "shadow-none";
}

export function InputSurface({
  variant = "field",
  focused = false,
  filled = false,
  className,
  ...props
}: InputSurfaceProps) {
  const active = focused || filled;
  return (
    <div
      className={cn(
        "flex w-full flex-col justify-center overflow-hidden rounded-(--cf-radius-row) border bg-cf-charcoal-900 text-cf-cream transition-[border-color,box-shadow,border-radius,padding,min-height] duration-(--cf-dur-content) ease-(--cf-ease)",
        borderClass(active, variant),
        glowClass(focused, active, variant),
        className
      )}
      {...props}
    />
  );
}
