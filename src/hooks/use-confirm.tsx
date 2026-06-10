"use client";

import { type ComponentProps, type JSX, useState } from "react";

import { ConfirmModal } from "@/components/common/confirm-modal";
import type { Button } from "@/components/ui/button";

type ButtonVariant = ComponentProps<typeof Button>["variant"];

interface UseConfirmOptions {
  cancelLabel?: string;
  confirmLabel?: string;
  message: string;
  title: string;
  variant?: ButtonVariant;
}

/**
 * Promise-based confirmation: `const [confirmDialog, confirm] = useConfirm(…)`.
 * Render `{confirmDialog}` once, then `if (await confirm()) { … }` in any
 * handler. Resolves false on cancel or dismiss.
 */
export function useConfirm({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
}: UseConfirmOptions): [JSX.Element, () => Promise<boolean>] {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () =>
    new Promise<boolean>((resolve) => {
      setPromise({ resolve });
    });

  const handleCancel = () => {
    promise?.resolve(false);
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    setPromise(null);
  };

  const confirmDialog = (
    <ConfirmModal
      cancelLabel={cancelLabel}
      confirmLabel={confirmLabel}
      message={message}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      open={promise !== null}
      title={title}
      variant={variant}
    />
  );

  return [confirmDialog, confirm];
}
