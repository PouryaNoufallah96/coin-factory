import {
  Inbox,
  LayoutDashboard,
  ListChecks,
  Settings,
  Tags,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { MaskIcon } from "@/components/common/mask-icon";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSignOutButton } from "@/features/admin/components/admin-sign-out-button";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: ReactNode;
  userEmail: string;
}

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/questions", icon: ListChecks, label: "Questions" },
  { href: "/admin/categories", icon: Tags, label: "Categories" },
  { href: "/admin/inquiries", icon: Inbox, label: "Inquiries" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
] as const;

export function AdminShell({ children, userEmail }: AdminShellProps) {
  return (
    <div className="min-h-dvh bg-cf-charcoal-900 text-cf-text-primary">
      <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-[16rem_1fr]">
        <aside className="border-cf-border-muted/30 border-b px-4 py-4 lg:border-r lg:border-b-0 lg:px-5 lg:py-6">
          <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-stretch">
            <Link
              aria-label="CoinFactory admin home"
              className="flex items-center gap-2 text-cf-cream"
              href="/admin"
            >
              <MaskIcon className="h-7 w-6" src="/brand/logo-c.svg" />
              <span className="font-logo text-lg leading-none">
                coinfactory
              </span>
            </Link>
            <nav
              aria-label="Admin navigation"
              className="hidden flex-col gap-1 lg:flex"
            >
              {navItems.map((item) => (
                <AdminNavItem key={item.href} {...item} />
              ))}
            </nav>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-16 items-center justify-between gap-4 border-cf-border-muted/30 border-b px-4 py-3 lg:px-8">
            <nav
              aria-label="Admin navigation"
              className="-mx-1 flex min-w-0 gap-1 overflow-x-auto lg:hidden"
            >
              {navItems.map((item) => (
                <AdminNavItem compact key={item.href} {...item} />
              ))}
            </nav>
            <div className="ml-auto flex min-w-0 items-center gap-3">
              <Badge
                className="hidden max-w-64 truncate sm:inline-flex"
                variant="secondary"
              >
                {userEmail}
              </Badge>
              <AdminSignOutButton />
            </div>
          </header>
          <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function AdminShellFallback({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-cf-charcoal-900 text-cf-text-primary">
      <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-[16rem_1fr]">
        <aside className="border-cf-border-muted/30 border-b px-4 py-4 lg:border-r lg:border-b-0 lg:px-5 lg:py-6">
          <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-stretch">
            <div className="flex items-center gap-2 text-cf-cream">
              <MaskIcon className="h-7 w-6" src="/brand/logo-c.svg" />
              <span className="font-logo text-lg leading-none">
                coinfactory
              </span>
            </div>
            <nav
              aria-label="Admin navigation"
              className="hidden flex-col gap-1 lg:flex"
            >
              {navItems.map((item) => (
                <AdminNavItem key={item.href} {...item} />
              ))}
            </nav>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-16 items-center justify-between gap-4 border-cf-border-muted/30 border-b px-4 py-3 lg:px-8">
            <nav
              aria-label="Admin navigation"
              className="-mx-1 flex min-w-0 gap-1 overflow-x-auto lg:hidden"
            >
              {navItems.map((item) => (
                <AdminNavItem compact key={item.href} {...item} />
              ))}
            </nav>
            <Skeleton className="ml-auto h-6 w-36 rounded-(--cf-radius-pill)" />
          </header>
          <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
      <output className="sr-only">Loading admin workspace</output>
    </div>
  );
}

function AdminNavItem({
  compact,
  href,
  icon: Icon,
  label,
}: (typeof navItems)[number] & { compact?: boolean }) {
  return (
    <Link
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-(--cf-radius-pill) border border-transparent px-3 text-cf-text-muted text-sm transition-colors hover:border-cf-border-muted/40 hover:bg-cf-chip-bg hover:text-cf-text-primary",
        compact && "shrink-0"
      )}
      href={href}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span>{label}</span>
    </Link>
  );
}
