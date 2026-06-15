import Image from "next/image";

export function ServicesPage() {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-start overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-1 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/brand/services-back.svg')",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl animate-[enter-fade-up_0.55s_cubic-bezier(0.2,0,0,1)_both]">
        <div className="mb-12 flex flex-col items-center gap-(--cf-hero-stack-gap) text-center">
          <h1 className="text-(length:--cf-text-hero-lg) font-bold text-cf-charcoal-900 text-shadow-(--cf-hero-shadow) leading-none">
            Services
          </h1>
        </div>

        <div className="flex flex-col">
          {SERVICES.map(({ title, description, icon, iconAlt }, index) => (
            <div className="flex gap-8" key={title}>
              <div className="flex flex-col items-center">
                <div className="flex size-18 items-center justify-center rounded-full bg-[#232831] shadow-[0_0_16px_0_#FFF2D199]">
                  <Image alt={iconAlt} height={32} src={icon} width={32} />
                </div>
                {index < SERVICES.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="my-2 w-px flex-1 border-cf-border-muted border-l-2 border-dashed"
                  />
                )}
              </div>

              <div className="flex w-full flex-col gap-3 pt-3 pb-12">
                <h2 className="font-semibold text-cf-cream text-xl leading-tight">
                  {title}
                </h2>
                <div className="rounded-[12px] bg-[#FFFAED14] px-6 py-4">
                  <p className="text-cf-text-primary text-sm leading-(--cf-leading-body)">
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
