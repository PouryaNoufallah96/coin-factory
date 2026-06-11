"use client";

import { Button } from "@/components/ui/button";

export default function FunnelError({ reset }: { reset: () => void }) {
  return (
    <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-(--cf-page-x)">
      <div className="cf-field-container flex flex-col items-center gap-5 text-center">
        <p className="font-light text-2xl text-cf-text-primary leading-tight sm:text-3xl">
          Something went wrong.
        </p>
        <Button onClick={reset} type="button" variant="outline">
          Try again
        </Button>
      </div>
    </section>
  );
}
