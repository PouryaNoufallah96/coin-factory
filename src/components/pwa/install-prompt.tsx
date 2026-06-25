"use client";

import { Download, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { SITE_NAME } from "@/config/site";

const DISMISSED_KEY = "cf-install-prompt-dismissed";
const SHOW_DELAY_MS = 4000;
const INSTALL_TOAST_ID = "pwa-install";
const IOS_UA_REGEX = /iPad|iPhone|iPod/;
const ANDROID_UA_REGEX = /Android/;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

interface InstallToastOptions {
  description: string;
  onInstall?: () => Promise<void>;
}

function showInstallToast({ description, onInstall }: InstallToastOptions) {
  const rememberDismissal = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  toast.custom(
    (toastId) => (
      <div className="relative flex w-[calc(100vw-2rem)] max-w-97.5 items-start gap-3 rounded-(--radius) border border-border bg-popover p-3 pr-10 text-popover-foreground shadow-lg">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-cf-cream/10 text-cf-cream">
          <Download aria-hidden="true" className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm leading-5">Install {SITE_NAME}</p>
          <p className="mt-0.5 text-popover-foreground/70 text-xs leading-5">
            {description}
          </p>
          {onInstall ? (
            <button
              className="mt-3 inline-flex h-8 items-center justify-center rounded-md bg-cf-cream px-3 font-bold text-primary-foreground text-xs transition hover:bg-cf-cream/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-cream/45"
              onClick={onInstall}
              type="button"
            >
              Install
            </button>
          ) : null}
        </div>
        <button
          aria-label="Dismiss install prompt"
          className="absolute top-2.5 right-2.5 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-cream/45"
          onClick={() => {
            rememberDismissal();
            toast.dismiss(toastId);
          }}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    ),
    {
      duration: Number.POSITIVE_INFINITY,
      id: INSTALL_TOAST_ID,
      onDismiss: rememberDismissal,
      unstyled: true,
    }
  );
}

export function InstallPrompt() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const isIOS = IOS_UA_REGEX.test(navigator.userAgent);
    const isAndroid = ANDROID_UA_REGEX.test(navigator.userAgent);
    if (!(isIOS || isAndroid)) {
      return;
    }

    if (isStandalone() || localStorage.getItem(DISMISSED_KEY)) {
      return;
    }

    const dismiss = () => localStorage.setItem(DISMISSED_KEY, "1");

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      deferredPromptRef.current = event as BeforeInstallPromptEvent;
    }
    function onAppInstalled() {
      dismiss();
      toast.dismiss(INSTALL_TOAST_ID);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    const timer = setTimeout(() => {
      if (isStandalone() || localStorage.getItem(DISMISSED_KEY)) {
        return;
      }

      if (isIOS) {
        showInstallToast({
          description: 'Tap Share, then "Add to Home Screen"',
        });
        return;
      }

      const deferredPrompt = deferredPromptRef.current;
      if (!deferredPrompt) {
        return;
      }

      showInstallToast({
        description: "Get quick access from your home screen.",
        onInstall: async () => {
          await deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          dismiss();
          toast.dismiss(INSTALL_TOAST_ID);
        },
      });
    }, SHOW_DELAY_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  return null;
}
