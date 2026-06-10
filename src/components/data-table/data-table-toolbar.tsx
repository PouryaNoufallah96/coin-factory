"use client";

import { Search, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps {
  canReset?: boolean;
  children?: ReactNode;
  className?: string;
  isPending?: boolean;
  onReset?: () => void;
  onSearchChange?: (value: string) => void;
  search?: string;
  searchPlaceholder?: string;
}

export function DataTableToolbar({
  canReset,
  children,
  className,
  isPending = false,
  onReset,
  onSearchChange,
  search = "",
  searchPlaceholder = "Search",
}: DataTableToolbarProps) {
  const hasSearch = search.trim().length > 0;
  const showReset = canReset ?? hasSearch;

  return (
    <div
      aria-orientation="horizontal"
      className={cn(
        "flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      role="toolbar"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1 sm:max-w-80">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label={searchPlaceholder}
            className="pl-9"
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            value={search}
          />
        </div>
        {children}
      </div>
      <div className="flex items-center gap-2">
        {isPending ? <Spinner aria-label="Updating table" /> : null}
        {onReset && showReset ? (
          <Button onClick={onReset} size="sm" type="button" variant="outline">
            <X data-icon="inline-start" />
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}
