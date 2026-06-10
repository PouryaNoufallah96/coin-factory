"use client";

import type { ComponentType, ErrorInfo, ReactElement, ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

import { Button } from "@/components/ui/button";

interface ComponentErrorBoundaryProps {
  children: ReactNode;
  /** Full replacement component with error + reset access. */
  FallbackComponent?: ComponentType<FallbackProps>;
  /** Static element — simplest option, no error info needed. */
  fallback?: ReactElement;
  /** Render prop with error + reset access. */
  fallbackRender?: (props: FallbackProps) => ReactNode;
  onError?: (error: unknown, errorInfo: ErrorInfo) => void;
}

function DefaultErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div
      className="flex flex-col items-center gap-3 p-6 text-center"
      role="alert"
    >
      <p className="text-muted-foreground text-sm">Something went wrong.</p>
      <Button onClick={resetErrorBoundary} size="sm" variant="outline">
        Try again
      </Button>
    </div>
  );
}

// react-error-boundary requires exactly one of:
// fallback | fallbackRender | FallbackComponent.
function pickFallbackProp({
  fallback,
  fallbackRender,
  FallbackComponent,
}: Pick<
  ComponentErrorBoundaryProps,
  "fallback" | "fallbackRender" | "FallbackComponent"
>) {
  if (fallback !== undefined) {
    return { fallback };
  }
  if (fallbackRender !== undefined) {
    return { fallbackRender };
  }
  return { FallbackComponent: FallbackComponent ?? DefaultErrorFallback };
}

/** Granular boundary for individual widgets/sections inside a route. */
export function ComponentErrorBoundary({
  children,
  onError,
  FallbackComponent,
  fallbackRender,
  fallback,
}: ComponentErrorBoundaryProps) {
  return (
    <ErrorBoundary
      {...pickFallbackProp({ fallback, fallbackRender, FallbackComponent })}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}
