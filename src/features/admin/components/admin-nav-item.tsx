"use client";

import {
  Inbox,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  Settings,
  Tags,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface AdminNavItemProps {
  compact?: boolean;
  href: string;
  icon: LucideIcon;
  label: string;
}

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/questions", icon: ListChecks, label: "Questions" },
  { href: "/admin/categories", icon: Tags, label: "Categories" },
  { href: "/admin/inquiries", icon: Inbox, label: "Inquiries" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
] as const;

export function AdminNavList({ compact }: { compact?: boolean }) {
  return (
    <>
      {navItems.map((item) => (
        <AdminNavItem compact={compact} key={item.href} {...item} />
      ))}
    </>
  );
}

function AdminNavItem({ compact, href, icon: Icon, label }: AdminNavItemProps) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-(--cf-radius-pill) border px-3 text-sm transition-colors",
        active
          ? "border-cf-cream/60 bg-cf-cream/10 text-cf-cream"
          : "border-transparent text-cf-text-muted hover:border-cf-border-muted/40 hover:bg-cf-chip-bg hover:text-cf-text-primary",
        compact && "shrink-0"
      )}
      href={href as Route}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span>{label}</span>
    </Link>
  );
}
