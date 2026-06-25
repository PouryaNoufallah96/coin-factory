"use client";

import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <TooltipProvider delay={300}>
      <div className={cn("flex items-center justify-end gap-1", className)}>
        {children}
      </div>
    </TooltipProvider>
  );
}

export function AdminRowActionButton({
  children,
  label,
  ...props
}: AdminRowActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button size="icon-sm" type="button" {...props}>
            {children}
            <span className="sr-only">{label}</span>
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
