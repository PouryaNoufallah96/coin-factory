"use client";

import { PageBackdrop } from "@/components/common/page-backdrop";
import { OpportunityRow } from "@/features/opportunities/components/opportunity-row";
import { ROW_ONE, ROW_TWO } from "@/features/opportunities/data/opportunities";
import { useOpportunityCycle } from "@/features/opportunities/hooks/use-opportunity-cycle";

export function OpportunitiesPage() {
  const cycle = useOpportunityCycle({
    rowOneLength: ROW_ONE.length,
    rowTwoLength: ROW_TWO.length,
  });

  const focusedItem =
    cycle.active.row === "row-one"
      ? ROW_ONE[cycle.active.index]
      : ROW_TWO[cycle.active.index];

  return (
    <section className="relative flex flex-1 flex-col items-center justify-start">
      <PageBackdrop src="/brand/q-back.svg" />

      <div className="relative z-10 flex w-full animate-[enter-fade-up_0.55s_cubic-bezier(0.2,0,0,1)_both] flex-col gap-15">
        <div className="flex flex-col gap-9">
          <div className="flex flex-col items-center gap-(--cf-hero-stack-gap) text-center">
            <h1 className="text-(length:--cf-text-hero-lg) font-bold text-cf-charcoal-900 text-shadow-(--cf-hero-shadow) leading-none">
              Tokenization Opportunities
            </h1>
          </div>

          <div className="flex flex-col text-center">
            <p className="mx-auto max-w-[80%] font-light text-cf-cream text-lg leading-(--cf-leading-body)">
              Tokenization allows assets, rights, revenue streams, businesses,
              communities, and digital ecosystems to be represented as
              blockchain-based digital assets. It creates new opportunities for
              fundraising, liquidity, ownership distribution, transparency,
              automation, and global participation across nearly every industry.{" "}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <OpportunityRow
            ariaLabel="Tokenization opportunities, row one"
            displayIndex={
              cycle.active.row === "row-one" ? cycle.active.index : -1
            }
            isPaused={cycle.isPaused}
            items={ROW_ONE}
            onCircleClick={(index) => cycle.onCircleClick("row-one", index)}
            onCircleEnter={(index) => cycle.onCircleEnter("row-one", index)}
            onCircleLeave={cycle.onCircleLeave}
            visualDirection="right"
          />
          <OpportunityRow
            ariaLabel="Tokenization opportunities, row two"
            displayIndex={
              cycle.active.row === "row-two" ? cycle.active.index : -1
            }
            isPaused={cycle.isPaused}
            items={ROW_TWO}
            onCircleClick={(index) => cycle.onCircleClick("row-two", index)}
            onCircleEnter={(index) => cycle.onCircleEnter("row-two", index)}
            onCircleLeave={cycle.onCircleLeave}
            visualDirection="left"
          />
        </div>

        <div
          className="cf-focus-panel mx-auto max-w-4xl rounded-(--cf-radius-panel) px-9 py-10 text-center backdrop-blur-sm"
          key={focusedItem.id}
        >
          <div className="flex animate-[enter-fade-up_0.3s_cubic-bezier(0.2,0,0,1)_both] flex-col gap-5">
            <h2 className="font-semibold text-[22px] text-cf-cream-bright leading-tight">
              {focusedItem.title}
            </h2>
            <p className="text-[16px] text-cf-charcoal-900 leading-(--cf-leading-body)">
              {focusedItem.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
