"use client";

import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminRowActionButtonProps
  extends Omit<ComponentProps<typeof Button>, "children" | "size" | "type"> {
  children: ReactNode;
  label: string;
}

export function AdminRowActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {children}
    </div>
  );
}

export function AdminRowActionButton({
  children,
  label,
  ...props
}: AdminRowActionButtonProps) {
  return (
    <Button size="icon-sm" title={label} type="button" {...props}>
      {children}
      <span className="sr-only">{label}</span>
    </Button>
  );
}
