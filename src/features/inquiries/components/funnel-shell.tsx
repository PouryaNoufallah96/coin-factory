"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type PointerEvent,
  type ReactNode,
  Suspense,
  useRef,
  useState,
} from "react";
import {
  FunnelFooter,
  FunnelSocialNav,
} from "@/features/inquiries/components/funnel-footer";
import { FunnelLogo } from "@/features/inquiries/components/funnel-logo";
import { FunnelSpotlights } from "@/features/inquiries/components/funnel-spotlights";
import { useFunnelDraft } from "@/features/inquiries/hooks/use-funnel-draft";
import { cn } from "@/lib/utils";

const FUNNEL_MENU_ITEMS = [
  {
    href: "/services",
    icon: "/icons/services.svg",
    label: "Services",
  },
  {
    href: "/opportunities",
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
  const pathname = usePathname();
  const { view } = useFunnelDraft();
  const hasFooter =
    (pathname === "/" || pathname === "/services" || pathname === "/about") &&
    view !== "onboarding";
  const hasBottomPadding = hasFooter || pathname === "/opportunities";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLElement>(null);

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

      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-transparent transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:hidden",
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      />
      <nav
        aria-label="Main menu"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[85vw] max-w-sm flex-col justify-between overflow-hidden bg-cf-charcoal-900 transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] sm:inset-y-auto sm:-top-5 sm:-right-8 sm:block sm:w-140 sm:max-w-none sm:rounded-[2rem] sm:border sm:shadow-(--cf-glow-menu) sm:transition-[opacity,transform]",
          menuOpen
            ? "pointer-events-auto translate-x-0 shadow-(--cf-glow-menu-mobile) sm:translate-y-0 sm:scale-50 sm:shadow-(--cf-glow-menu)"
            : "pointer-events-none translate-x-full shadow-none sm:-translate-y-2 sm:scale-50 sm:opacity-0"
        )}
        ref={menuPanelRef}
      >
        <button
          aria-label="Close menu"
          className="absolute top-4 right-4 z-10 flex size-(--cf-touch) items-center justify-center rounded-full text-cf-cream transition-colors duration-(--cf-dur-feedback) ease-(--cf-ease) hover:bg-cf-cream/10 active:scale-95 sm:hidden"
          onClick={() => setMenuOpen(false)}
          type="button"
        >
          <X aria-hidden="true" className="size-5" />
        </button>

        <div className="mt-15 sm:mt-0">
          {FUNNEL_MENU_ITEMS.map((item, index) => (
            <Link
              className="group sm:text-(length:--cf-text-field-label) flex h-16 items-center gap-3 border-cf-cream/15 border-b px-5 text-left text-sm text-white transition-colors duration-(--cf-dur-content) ease-(--cf-ease) last:border-b-0 hover:bg-cf-cream/8 sm:h-30 sm:gap-8 sm:px-11"
              href={item.href}
              key={item.href}
              onClick={() => {
                setMenuOpen(false);
              }}
              style={{
                transitionDelay: menuOpen ? `${index * 35}ms` : "0ms",
              }}
            >
              <span className="flex size-6 shrink-0 items-center justify-center transition-transform duration-(--cf-dur-content) ease-(--cf-ease) group-hover:scale-105 sm:size-11">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="size-6 sm:size-11"
                  height={40}
                  src={item.icon}
                  width={40}
                />
              </span>
              <span className="min-w-0">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 px-11 py-6 sm:hidden">
          <FunnelSocialNav className="flex-wrap justify-center" />
          <span className="whitespace-nowrap text-center font-legal text-[16px] text-cf-white">
            @ 2025 CoinFactory AG
            <br />
            <span className="text-[#A7A9AD] text-[14px]">Zug, Switzerland</span>
          </span>
        </div>
      </nav>
      <main
        className={cn(
          "relative z-10 flex min-h-0 flex-1 flex-col pt-(--cf-header-h)",
          hasBottomPadding ? "pb-(--cf-footer-h)" : "pb-0"
        )}
      >
        {children}
      </main>
      <Suspense fallback={null}>
        <FunnelFooter />
      </Suspense>
    </div>
  );
}
