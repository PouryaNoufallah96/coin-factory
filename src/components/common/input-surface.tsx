import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

import { inputSurfaceVariants } from "./input-surface-variants";

interface InputSurfaceProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof inputSurfaceVariants> {}

export function InputSurface({
  active,
  className,
  ...props
}: InputSurfaceProps) {
  return (
    <div
      className={cn(inputSurfaceVariants({ active }), className)}
      {...props}
    />
  );
}
