"use client";

import { Search, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { FILTER_URL_UPDATE_DEBOUNCE_MS } from "@/lib/filter-params";
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
  const updateSearch = useDebouncedCallback(
    (value: string) => onSearchChange?.(value),
    FILTER_URL_UPDATE_DEBOUNCE_MS
  );

  return (
    <div
      aria-orientation="horizontal"
      className={cn(
        "flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      role="toolbar"
    >
      <div className="relative w-full min-w-0 sm:max-w-xs">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label={searchPlaceholder}
          className="pl-9"
          defaultValue={search}
          key={search}
          onValueChange={updateSearch}
          placeholder={searchPlaceholder}
        />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
        {children}
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
