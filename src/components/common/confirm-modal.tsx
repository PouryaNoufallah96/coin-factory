"use client";

import type { ComponentProps } from "react";

import { ResponsiveModal } from "@/components/common/responsive-modal";
import { Button } from "@/components/ui/button";

type ButtonVariant = ComponentProps<typeof Button>["variant"];

interface ConfirmModalProps {
  cancelLabel: string;
  confirmLabel: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
  variant: ButtonVariant;
}

function ConfirmModal({
  cancelLabel,
  confirmLabel,
  message,
  onCancel,
  onConfirm,
  open,
  title,
  variant,
}: ConfirmModalProps) {
  return (
    <ResponsiveModal
      description={message}
      onOpenChange={(next) => {
        if (!next) {
          onCancel();
        }
      }}
      open={open}
      size="default"
      title={title}
    >
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">{message}</p>
        <div className="flex w-full flex-col justify-end gap-2 sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            onClick={onCancel}
            variant="outline"
          >
            {cancelLabel}
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={onConfirm}
            variant={variant}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}

export { ConfirmModal };
