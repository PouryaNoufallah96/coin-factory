"use client";

import { cva, type VariantProps } from "class-variance-authority";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsDesktop } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const SIZE_TO_MAX_WIDTH = {
  sm: "sm:max-w-sm",
  default: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
  full: "sm:max-w-full",
} as const;

const sheetVariants = cva("flex flex-col gap-2 px-0 pb-4", {
  variants: { size: SIZE_TO_MAX_WIDTH },
  defaultVariants: { size: "default" },
});

const dialogVariants = cva("p-0", {
  variants: { size: SIZE_TO_MAX_WIDTH },
  defaultVariants: { size: "lg" },
});

interface ResponsiveModalProps extends VariantProps<typeof sheetVariants> {
  children: React.ReactNode;
  description?: string;
  /** Desktop renders a side Sheet instead of a centered Dialog. */
  isSheet?: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  side?: "left" | "right";
  title: string;
}

/**
 * One modal API for every viewport: Dialog (or Sheet) on desktop, bottom
 * Drawer on mobile. Title is required for accessibility — pass
 * `description` when the content needs more context for screen readers.
 */
export function ResponsiveModal({
  children,
  open,
  onOpenChange,
  title,
  description,
  isSheet = false,
  side = "right",
  size,
}: ResponsiveModalProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop && isSheet) {
    return (
      <Sheet onOpenChange={onOpenChange} open={open}>
        <SheetContent className={cn(sheetVariants({ size }))} side={side}>
          <SheetHeader className="px-4 py-3">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription className={cn(!description && "sr-only")}>
              {description ?? title}
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (isDesktop) {
    return (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className={cn(dialogVariants({ size }))}>
          <DialogTitle className="px-6 pt-6">{title}</DialogTitle>
          <DialogDescription className={cn(!description && "sr-only", "px-6")}>
            {description ?? title}
          </DialogDescription>
          <div className="max-h-(--cf-modal-max-h) overflow-y-auto px-6 pb-6">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="flex h-auto max-h-(--cf-modal-max-h) flex-col">
        <DrawerHeader className="shrink-0">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription className={cn(!description && "sr-only")}>
            {description ?? title}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
