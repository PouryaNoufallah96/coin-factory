"use client";

import { PageBackdrop } from "@/components/common/page-backdrop";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { OpportunityRow } from "@/features/opportunities/components/opportunity-row";
import {
  MOBILE_ROW_ONE,
  MOBILE_ROW_THREE,
  MOBILE_ROW_TWO,
  ROW_ONE,
  ROW_TWO,
} from "@/features/opportunities/data/opportunities";
import { useOpportunityCycle } from "@/features/opportunities/hooks/use-opportunity-cycle";
import { useIsDesktop } from "@/hooks/use-media-query";

const DESKTOP_ROWS = [
  { direction: "right" as const, id: "row-one", items: ROW_ONE },
  { direction: "left" as const, id: "row-two", items: ROW_TWO },
];

const MOBILE_ROWS = [
  { direction: "right" as const, id: "row-one", items: MOBILE_ROW_ONE },
  { direction: "left" as const, id: "row-two", items: MOBILE_ROW_TWO },
  { direction: "right" as const, id: "row-three", items: MOBILE_ROW_THREE },
];

export function OpportunitiesPage() {
  const isDesktop = useIsDesktop();
  const rows = isDesktop ? DESKTOP_ROWS : MOBILE_ROWS;

  const cycle = useOpportunityCycle({
    rowOneLength: rows[0].items.length,
    rowTwoLength: rows[1].items.length,
  });

  const focusedItem = cycle.active
    ? (rows.find((row) => row.id === cycle.active?.row)?.items[
        cycle.active.index
      ] ?? null)
    : null;

  return (
    <section className="relative flex flex-1 flex-col items-center justify-start">
      <PageBackdrop
        mobileSrc="/brand/opportunity-mobile.svg"
        src="/brand/q-back.svg"
      />

      <div className="relative z-10 mt-8 flex w-full animate-[enter-fade-up_0.55s_cubic-bezier(0.2,0,0,1)_both] flex-col gap-18 sm:mt-0 sm:gap-20">
        <div className="flex flex-col gap-7 sm:gap-9">
          <div className="flex flex-col items-center gap-(--cf-hero-stack-gap) text-center">
            <h1 className="text-(length:--cf-text-hero-lg) font-bold text-cf-charcoal-900 text-shadow-(--cf-hero-shadow) leading-none">
              Tokenization Opportunities
            </h1>
          </div>

          <div className="flex flex-col text-center">
            <p className="mx-auto max-w-[90%] font-light text-cf-cream text-sm leading-tight sm:max-w-[80%] sm:text-lg">
              Tokenization allows assets, rights, revenue streams, businesses,
              communities, and digital ecosystems to be represented as
              blockchain-based digital assets. It creates new opportunities for
              fundraising, liquidity, ownership distribution, transparency,
              automation, and global participation across nearly every industry.{" "}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          {rows.map((row, rowNumber) => (
            <OpportunityRow
              ariaLabel={`Tokenization opportunities, row ${rowNumber + 1}`}
              displayIndex={
                cycle.active?.row === row.id ? cycle.active.index : -1
              }
              isPaused={isDesktop ? cycle.isPaused : !!focusedItem}
              items={row.items}
              key={row.id}
              onCircleClick={(index) => cycle.onCircleClick(row.id, index)}
              onCircleEnter={(index) => cycle.onCircleEnter(row.id, index)}
              onCircleLeave={cycle.onCircleLeave}
              visualDirection={row.direction}
            />
          ))}
        </div>

        {isDesktop && focusedItem && (
          <div
            className="cf-focus-panel mx-auto max-w-4xl rounded-(--cf-radius-panel) px-9 py-9 text-center backdrop-blur-sm"
            key={focusedItem.id}
          >
            <div className="flex animate-[enter-fade-up_0.3s_cubic-bezier(0.2,0,0,1)_both] flex-col gap-5 leading-tight">
              <h2 className="font-semibold text-[22px] text-cf-cream-bright">
                {focusedItem.title}
              </h2>
              <p className="text-[16px] text-cf-charcoal-900">
                {focusedItem.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {!isDesktop && (
        <Drawer
          onOpenChange={(open) => {
            if (!open && cycle.active) {
              cycle.onCircleClick(cycle.active.row, cycle.active.index);
            }
          }}
          open={!!focusedItem}
        >
          <DrawerContent
            className="border-none bg-cf-charcoal-900 px-9 pb-9 shadow-[0px_0px_8px_0px_#FFF2D166] data-[vaul-drawer-direction=bottom]:rounded-t-[30px]"
            overlayClassName="bg-[#23283166] backdrop-blur-none supports-backdrop-filter:backdrop-blur-none"
          >
            {focusedItem && (
              <div className="mt-7 flex flex-col items-center gap-5 text-center">
                <DrawerTitle className="font-semibold text-cf-cream-bright text-lg">
                  {focusedItem.title}
                </DrawerTitle>
                <p className="text-cf-white text-sm leading-relaxed">
                  {focusedItem.description}
                </p>
              </div>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </section>
  );
}
