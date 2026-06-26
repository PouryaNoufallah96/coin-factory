"use client";

import type { Opportunity } from "@/features/opportunities/data/opportunities";
import { cn } from "@/lib/utils";

interface OpportunityRowProps {
  ariaLabel: string;
  displayIndex: number;
  isPaused: boolean;
  items: Opportunity[];
  onCircleClick: (index: number) => void;
  onCircleEnter: (index: number) => void;
  onCircleLeave: () => void;
  visualDirection: "right" | "left";
}

export function OpportunityRow({
  items,
  visualDirection,
  displayIndex,
  isPaused,
  onCircleClick,
  onCircleEnter,
  onCircleLeave,
  ariaLabel,
}: OpportunityRowProps) {
  const trackItems = [
    ...items.map((item) => ({ ...item, copy: "a", isLeading: true })),
    ...items.map((item) => ({ ...item, copy: "b", isLeading: false })),
  ];
  const sourceIndexById = new Map(items.map((item, index) => [item.id, index]));

  return (
    <section aria-label={ariaLabel} className="-my-4 overflow-hidden py-4">
      <div
        className={cn(
          "flex w-max will-change-transform",
          visualDirection === "right"
            ? "animate-[cf-marquee-track-reverse_220s_linear_infinite]"
            : "animate-[cf-marquee-track_220s_linear_infinite]"
        )}
        style={{
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {trackItems.map((item) => {
          const sourceIndex = sourceIndexById.get(item.id) ?? 0;
          const isActive = sourceIndex === displayIndex;

          return (
            <button
              aria-pressed={isActive}
              className={cn(
                "mr-3.5 flex size-28 shrink-0 items-center justify-center rounded-full border px-4 text-center transition-[background-color,color,transform] duration-(--cf-dur-content) ease-(--cf-ease) sm:mr-6 sm:size-32",
                isActive
                  ? "scale-105 border-cf-cream bg-cf-cream text-cf-charcoal-900 shadow-[0px_0px_8px_0px_#FFF2D166] sm:shadow-(--cf-glow-circle-active)"
                  : "border-cf-cream/15 bg-cf-charcoal-900 text-cf-cream shadow-[0px_0px_8px_0px_#FFF2D166] hover:border-cf-cream/40 sm:shadow-(--cf-glow-icon)"
              )}
              key={`${item.id}-${item.copy}`}
              onBlur={onCircleLeave}
              onClick={() => onCircleClick(sourceIndex)}
              onFocus={() => onCircleEnter(sourceIndex)}
              onMouseEnter={() => onCircleEnter(sourceIndex)}
              onMouseLeave={onCircleLeave}
              tabIndex={item.isLeading ? 0 : -1}
              type="button"
            >
              <span className="font-normal text-[12px] leading-snug tracking-wide sm:font-semibold sm:text-xs">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
