import { TriangleAlert, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface FunnelAlertProps {
  message: string;
  onDismiss?: () => void;
}

export function FunnelAlert({ message, onDismiss }: FunnelAlertProps) {
  const alert = (
    <div
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-(--cf-radius-alert) bg-cf-error px-4 text-cf-text-on-error animate-[enter-fade-up_200ms_cubic-bezier(0.2,0,0,1)_both]",
        onDismiss ? "mx-auto max-w-(--cf-field-w)" : "cf-field-container w-full"
      )}
      role="alert"
    >
      <TriangleAlert aria-hidden="true" className="size-5 shrink-0" />
      <p
        className={cn(
          "min-w-0 flex-1 text-cf-text-on-error",
          onDismiss
            ? "text-left font-medium text-sm leading-tight sm:text-base"
            : "text-sm sm:text-base"
        )}
      >
        {message}
      </p>
      {onDismiss ? (
        <button
          aria-label="Dismiss"
          className="-mr-2 flex size-9 shrink-0 items-center justify-center rounded-full text-cf-text-on-error transition-colors duration-(--cf-dur-feedback) ease-(--cf-ease) hover:bg-cf-cream/10"
          onClick={onDismiss}
          type="button"
        >
          <X aria-hidden="true" className="size-3" />
        </button>
      ) : null}
    </div>
  );

  if (onDismiss) {
    return (
      <div className="fixed top-4 right-6 left-6 z-30 sm:top-10 sm:right-10 sm:left-10">
        {alert}
      </div>
    );
  }

  return alert;
}
