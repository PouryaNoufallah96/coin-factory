"use client";

import { Button } from "@/components/ui/button";

export default function AdminPanelError({ reset }: { reset: () => void }) {
  return (
    <section className="flex min-h-80 max-w-3xl flex-col justify-center gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-cf-cream text-sm">Admin</p>
        <h1 className="font-semibold text-2xl text-cf-text-primary tracking-normal sm:text-3xl">
          Something went wrong.
        </h1>
        <p className="max-w-xl text-cf-text-muted text-sm">
          The admin view could not load.
        </p>
      </div>
      <div>
        <Button onClick={reset} type="button" variant="outline">
          Try again
        </Button>
      </div>
    </section>
  );
}
