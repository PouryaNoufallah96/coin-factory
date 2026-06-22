"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CopyToClipboardButtonProps {
  label: string;
  value: string;
}

export function CopyToClipboardButton({
  label,
  value,
}: CopyToClipboardButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <TooltipProvider delay={300}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label={`Copy ${label}`}
              onClick={handleCopy}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <span className="relative flex size-4 items-center justify-center">
                <Copy
                  aria-hidden="true"
                  className={`absolute size-4 transition-all duration-200 ${
                    copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
                  }`}
                />
                <Check
                  aria-hidden="true"
                  className={`absolute size-4 text-green-600 transition-all duration-200 ${
                    copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
                  }`}
                />
              </span>
            </Button>
          }
        />
        <TooltipContent>{copied ? "Copied" : `Copy ${label}`}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
