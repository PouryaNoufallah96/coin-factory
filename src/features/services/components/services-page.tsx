import Image from "next/image";
import { PageBackdrop } from "@/components/common/page-backdrop";

export function ServicesPage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-var(--cf-header-h)-var(--cf-footer-h))] flex-1 flex-col items-center justify-start overflow-visible">
      <PageBackdrop
        mobileSrc="/brand/services-back-mobile.svg"
        src="/brand/services-back.svg"
      />

      <div className="relative z-10 mt-8 w-full max-w-4xl flex-1 animate-[enter-fade-up_0.55s_cubic-bezier(0.2,0,0,1)_both] px-4 sm:mt-0 sm:px-0">
        <div className="mb-12 flex flex-col items-center gap-(--cf-hero-stack-gap) text-center">
          <h1 className="text-(length:--cf-text-hero-lg) font-bold text-cf-charcoal-900 text-shadow-(--cf-hero-shadow) leading-none">
            Services
          </h1>
        </div>

        <div className="flex flex-col">
          {SERVICES.map(({ title, description, icon, iconAlt }, index) => (
            <div className="group flex gap-3 sm:gap-8" key={title}>
              <div className="flex flex-col items-center pt-7 sm:pt-4">
                <div className="flex size-15 items-center justify-center rounded-full bg-cf-charcoal-900 shadow-(--cf-glow-icon) sm:size-18">
                  <Image
                    alt={iconAlt}
                    className="size-6.5 group-hover:animate-[icon-shake_0.3s_ease-in-out] sm:size-8"
                    height={32}
                    src={icon}
                    width={32}
                  />
                </div>
                {index < SERVICES.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="mt-1 -mb-4 w-px flex-1 bg-[repeating-linear-gradient(to_bottom,var(--cf-cream-bright)_0_4px,transparent_4px_10px)]"
                  />
                )}
              </div>

              <div className="flex w-full flex-col gap-3 pt-3 pb-12">
                <h2 className="font-semibold text-cf-cream text-lg leading-tight sm:text-xl">
                  {title}
                </h2>
                <div className="rounded-[12px] bg-cf-cream-soft/8 px-4 py-3 sm:px-6 sm:py-4">
                  <p className="text-cf-text-primary text-xs leading-(--cf-leading-body) sm:text-sm">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const SERVICES = [
  {
    title: "Tokenization Strategy",
    description:
      "Evaluate opportunities and define the right tokenization model.",
    icon: "/icons/interactive.svg",
    iconAlt: "Strategy icon",
  },
  {
    title: "Asset Tokenization",
    description:
      "Tokenize businesses, real-world assets, commodities, revenue streams, and digital ecosystems.",
    icon: "/icons/layers.svg",
    iconAlt: "Tokenize icon",
  },
  {
    title: "Tokenomics Design",
    description:
      "Design sustainable token economies, utility models, supply structures, and incentive systems.",
    icon: "/icons/notification.svg",
    iconAlt: "Tokenomics icon",
  },
  {
    title: "Smart Contract Development",
    description:
      "Develop secure smart contracts for token issuance, distribution, governance, and ecosystem operations.",
    icon: "/icons/board.svg",
    iconAlt: "Smart contract icon",
  },
  {
    title: "Token Launch & Deployment",
    description:
      "Launch tokens across leading blockchain networks with scalable infrastructure.",
    icon: "/icons/globe.svg",
    iconAlt: "Exchange icon",
  },
  {
    title: "Exchange Listing Support",
    description:
      "Coordinate professional smart contract audits through trusted security partners.",
    icon: "/icons/shield.svg",
    iconAlt: "Launch icon",
  },
  {
    title: "Security Audit Coordination",
    description:
      "Support token listing preparation for centralized and decentralized exchanges.",
    icon: "/icons/exchange.svg",
    iconAlt: "Launch icon",
  },
  {
    title: "Ecosystem Development",
    description:
      "Build loyalty systems, rewards, governance models, staking systems, and community engagement mechanisms.",
    icon: "/icons/share.svg",
    iconAlt: "Launch icon",
  },
  {
    title: "Venture Partnership",
    description:
      "For selected projects, CoinFactory may participate as a strategic tokenization partner.",
    icon: "/icons/venture.svg",
    iconAlt: "Launch icon",
  },
];
