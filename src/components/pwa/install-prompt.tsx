"use client";

import { Download, Share, X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const DISMISS_STORAGE_KEY = "cf-install-prompt-dismissed-at";
const DISMISS_DAYS = 14;
const SHOW_DELAY_MS = 3000;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

function wasRecentlyDismissed() {
  const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
  const dismissedAt = raw ? Number(raw) : Number.NaN;
  if (Number.isNaN(dismissedAt)) {
    return false;
  }
  const elapsedDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return elapsedDays < DISMISS_DAYS;
}

function isRunningStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

const IOS_SAFARI_REGEX = /iphone|ipad|ipod/i;

function isIosSafari() {
  return IOS_SAFARI_REGEX.test(navigator.userAgent);
}

const MOBILE_UA_REGEX = /android|iphone|ipad|ipod/i;

function isMobile() {
  return MOBILE_UA_REGEX.test(navigator.userAgent);
}

export function InstallPrompt() {
  const deferredEventRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!isMobile() || isRunningStandalone() || wasRecentlyDismissed()) {
      return;
    }

    function dismiss(toastId: string | number) {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
      toast.dismiss(toastId);
    }

    function showInstallToast(event: BeforeInstallPromptEvent) {
      toast.custom(
        (toastId) => (
          <InstallToastCard
            description="Add CoinFactory to your home screen for quick, full-screen access."
            icon={<Download className="size-4" />}
            onDismiss={() => dismiss(toastId)}
            onInstall={async () => {
              await event.prompt();
              dismiss(toastId);
            }}
            primaryLabel="Install"
          />
        ),
        { duration: Number.POSITIVE_INFINITY }
      );
    }

    function showIosInstructionToast() {
      toast.custom(
        (toastId) => (
          <InstallToastCard
            description='Tap Share, then "Add to Home Screen" for quick, full-screen access.'
            icon={<Share className="size-4" />}
            onDismiss={() => dismiss(toastId)}
          />
        ),
        { duration: Number.POSITIVE_INFINITY }
      );
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      deferredEventRef.current = event as BeforeInstallPromptEvent;
      timeoutId = setTimeout(() => {
        if (deferredEventRef.current) {
          showInstallToast(deferredEventRef.current);
        }
      }, SHOW_DELAY_MS);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (isIosSafari()) {
      timeoutId = setTimeout(showIosInstructionToast, SHOW_DELAY_MS);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
}

function InstallToastCard({
  description,
  icon,
  onDismiss,
  onInstall,
  primaryLabel,
}: {
  description: string;
  icon: ReactNode;
  onDismiss: () => void;
  onInstall?: () => void;
  primaryLabel?: string;
}) {
  return (
    <div className="flex w-full max-w-sm items-start gap-3 rounded-(--radius) border border-border bg-popover p-4 text-popover-foreground shadow-lg">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cf-cream/10 text-cf-cream">
        {icon}
      </div>
      <div className="flex-1 space-y-2">
        <p className="font-medium text-sm leading-snug">{description}</p>
        <div className="flex gap-2">
          {onInstall && (
            <Button onClick={onInstall} size="sm">
              {primaryLabel}
            </Button>
          )}
          <Button onClick={onDismiss} size="sm" variant="ghost">
            Not now
          </Button>
        </div>
      </div>
      <button
        aria-label="Dismiss"
        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        onClick={onDismiss}
        type="button"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
