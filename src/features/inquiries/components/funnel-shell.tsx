"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  type PointerEvent,
  type ReactNode,
  Suspense,
  useRef,
  useState,
} from "react";
import { Toaster } from "@/components/ui/sonner";
import { FunnelFooter } from "@/features/inquiries/components/funnel-footer";
import { FunnelLogo } from "@/features/inquiries/components/funnel-logo";
import { FunnelSpotlights } from "@/features/inquiries/components/funnel-spotlights";
import { useFunnelHome } from "@/features/inquiries/hooks/use-funnel-home";
import { cn } from "@/lib/utils";

const FUNNEL_MENU_ITEMS = [
  {
    href: "/services",
    icon: "/icons/services.svg",
    label: "Services",
  },
  {
    href: "/",
    icon: "/icons/opportunity.svg",
    label: "Tokenization Opportunities",
  },
  {
    href: "/about",
    icon: "/icons/about.svg",
    label: "About Us",
  },
] as const;

export function FunnelShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLElement>(null);
  const goHome = useFunnelHome();

  function closeMenuFromOutside(event: PointerEvent<HTMLDivElement>) {
    if (!(menuOpen && event.target instanceof Node)) {
      return;
    }

    if (
      menuButtonRef.current?.contains(event.target) ||
      menuPanelRef.current?.contains(event.target)
    ) {
      return;
    }

    setMenuOpen(false);
  }

  return (
    <div
      className="relative isolate flex min-h-dvh flex-col overflow-x-hidden text-cf-text-primary"
      onPointerDownCapture={closeMenuFromOutside}
    >
      <Suspense fallback={null}>
        <FunnelSpotlights />
      </Suspense>
      <header className="fixed top-0 right-0 left-0 z-40 flex h-(--cf-header-h) shrink-0 items-center justify-between px-(--cf-page-x)">
        <div
          aria-hidden="true"
          className="mask-[linear-gradient(to_bottom,black_40%,transparent_100%)] pointer-events-none absolute inset-0 -z-10 [backdrop-filter:blur(50px)]"
        />
        <FunnelLogo />
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className={cn(
            "flex size-(--cf-touch) items-center justify-center rounded-(--cf-radius-icon) text-cf-cream transition-[background-color,transform] duration-(--cf-dur-feedback) ease-(--cf-ease) hover:bg-cf-cream/10 active:scale-95",
            menuOpen && "bg-cf-charcoal-900/40"
          )}
          onClick={() => setMenuOpen((open) => !open)}
          ref={menuButtonRef}
          type="button"
        >
          <Menu aria-hidden="true" className="size-7" />
        </button>
      </header>

      <nav
        aria-label="Main menu"
        className={cn(
          "t-0 fixed top-0 -right-8 z-30 w-140 overflow-hidden rounded-[2rem] border border-cf-cream/10 bg-cf-charcoal-900/80 shadow-(--cf-glow-menu) backdrop-blur-xl transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          menuOpen
            ? "pointer-events-auto translate-y-0 scale-50 opacity-100"
            : "pointer-events-none -translate-y-2 scale-50 opacity-0"
        )}
        ref={menuPanelRef}
      >
        {FUNNEL_MENU_ITEMS.map((item, index) => (
          <Link
            className="group text-(length:--cf-text-field-label) flex h-30 items-center gap-8 border-cf-cream/15 border-b px-11 text-left text-white transition-colors duration-(--cf-dur-content) ease-(--cf-ease) last:border-b-0 hover:bg-cf-cream/8"
            href={item.href}
            key={item.href}
            onClick={(event) => {
              setMenuOpen(false);
              if (item.href === "/") {
                goHome(event);
              }
            }}
            style={{
              transitionDelay: menuOpen ? `${index * 35}ms` : "0ms",
            }}
          >
            <span className="flex size-10 shrink-0 items-center justify-center transition-transform duration-(--cf-dur-content) ease-(--cf-ease) group-hover:scale-105">
              <Image
                alt=""
                aria-hidden="true"
                className="size-10"
                height={40}
                src={item.icon}
                width={40}
              />
            </span>
            <span className="min-w-0">{item.label}</span>
          </Link>
        ))}
      </nav>
      <main className="relative z-10 flex min-h-0 flex-1 flex-col pt-(--cf-header-h) pb-(--cf-footer-h)">
        {children}
      </main>
      <Suspense fallback={null}>
        <FunnelFooter />
      </Suspense>
      <Toaster
        closeButton
        expand
        position="top-left"
        toastOptions={{
          classNames: {
            toast: "w-max! max-w-[80vw]! whitespace-normal!",
            error:
              "bg-cf-error! text-cf-text-on-error! border-0! rounded-(--cf-radius-alert)! min-h-14 font-medium pr-15!",
            icon: "text-cf-text-on-error!",
            closeButton:
              "!left-auto !right-2 !top-1/2 ![transform:translateY(-50%)] !size-6 [&>svg]:!size-4 bg-cf-error! border-0! text-cf-text-on-error! hover:opacity-70!",
          },
        }}
      />
    </div>
  );
}
