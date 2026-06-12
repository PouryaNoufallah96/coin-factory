"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/features/auth/api/client";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-redirect";

export function AdminSignOutButton() {
  const [isPending, setIsPending] = useState(false);

  const signOut = async () => {
    setIsPending(true);
    await authClient.signOut();
    window.location.assign(ADMIN_LOGIN_PATH);
  };

  return (
    <Button
      aria-label="Sign out"
      className="rounded-(--cf-radius-pill) border-cf-border-muted text-cf-text-primary hover:border-cf-border-active hover:bg-cf-chip-bg"
      disabled={isPending}
      onClick={signOut}
      size="icon"
      type="button"
      variant="outline"
    >
      <LogOut aria-hidden="true" />
    </Button>
  );
}
