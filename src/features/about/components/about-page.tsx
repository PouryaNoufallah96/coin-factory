import { Fragment } from "react";
import { MaskIcon } from "@/components/common/mask-icon";
import { PageBackdrop } from "@/components/common/page-backdrop";
import { ApproachIllustration } from "@/features/about/components/illustrations/approach-illustration";
import { WhatIllustration } from "@/features/about/components/illustrations/what-illustration";
import { WorldIllustration } from "@/features/about/components/illustrations/world-illustration";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    title: "Who We Are",
    description:
      "CoinFactory is a Switzerland-based tokenization company located in Zug, helping businesses transform assets, communities, products, and ventures into blockchain-powered economies.",
    Illustration: WorldIllustration,
    imageAlt: "World map illustration",
  },
  {
    title: "What We Do",
    description:
      "We evaluate, design, and launch tokenization opportunities. From real-world assets and businesses to digital communities and platforms, we help founders build sustainable token economies.",
    Illustration: WhatIllustration,
    imageAlt: "What we do illustration",
  },
  {
    title: "Our Approach",
    description:
      "We do more than create tokens. We identify opportunities, evaluate potential, and support the development of long-term token ecosystems.",
    Illustration: ApproachIllustration,
    imageAlt: "Approach illustration",
  },
];

const CONTACT = [
  {
    icon: "/icons/about/location.svg",
    label: "Coin Factory AG, Bellerivestrasse 241, 8008 Zürich, Switzerland",
    href: "https://www.google.com/maps/search/?api=1&query=Coin+Factory+AG+Bellerivestrasse+241+8008+Z%C3%BCrich+Switzerland",
    mobileOrder: "order-3",
  },
  {
    icon: "/icons/about/call.svg",
    label: "+41 76 460 9000",
    href: "tel:+41764609000",
    mobileOrder: "order-1",
  },
  {
    icon: "/icons/about/envelope.svg",
    label: "info@coinfactory.com",
    href: "mailto:info@coinfactory.com",
    mobileOrder: "order-2",
  },
];

export function AboutPage() {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-start overflow-visible sm:overflow-hidden">
      <PageBackdrop
        mobileSrc="/brand/about-back-mobile.svg"
        src="/brand/about-back.svg"
      />

      <div className="relative z-10 mt-8 flex animate-[enter-fade-up_0.55s_cubic-bezier(0.2,0,0,1)_both] flex-col gap-6 sm:mt-0 sm:gap-10">
        <div className="flex flex-col items-center gap-(--cf-hero-stack-gap) text-center">
          <h1 className="text-(length:--cf-text-hero-lg) font-bold text-cf-charcoal-900 text-shadow-(--cf-hero-shadow) leading-none">
            About Us
          </h1>
        </div>

        <div className="m-auto flex w-[80%] flex-col gap-6 text-center sm:w-auto">
          <p className="font-light text-cf-text-primary text-lg leading-(--cf-leading-body) sm:text-xl">
            CoinFactory is a tokenization company, helping businesses transform
            assets,
            <br /> communities, products, and ventures into blockchain-powered
            economies.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 justify-items-center gap-10 sm:mt-4 sm:grid-cols-3 sm:justify-items-stretch">
          {CARDS.map(({ title, description, Illustration, imageAlt }) => (
            <div
              className="group flex max-w-90 flex-col overflow-hidden rounded-[20px] bg-cf-cream-soft/24"
              key={title}
            >
              <div className="w-full overflow-hidden">
                <Illustration
                  aria-label={imageAlt}
                  className="h-full w-full object-cover"
                  role="img"
                />
              </div>
              <div className="flex flex-col gap-3 p-6">
                <h2 className="font-logo text-2xl text-cf-cream-bright text-shadow-[0px_0px_4px_var(--cf-charcoal-900)] leading-tight">
                  {title}
                </h2>
                <p className="text-cf-charcoal-900 text-sm leading-(--cf-leading-body)">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto flex w-full max-w-90 flex-col gap-4 rounded-[16px] bg-cf-cream-soft/24 px-7 py-6 sm:h-16 sm:max-w-none sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-10 sm:py-0">
          {CONTACT.map(({ icon, label, href, mobileOrder }, index) => (
            <Fragment key={label}>
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="hidden h-6 w-px shrink-0 bg-[#FFF2D1] sm:block"
                />
              )}
              <a
                className={cn(
                  "flex items-center gap-3 text-cf-cream transition-opacity hover:opacity-70 sm:order-none",
                  mobileOrder
                )}
                href={href}
              >
                <MaskIcon className="size-6 shrink-0" src={icon} />
                <span className="font-normal text-base leading-(--cf-leading-body) sm:whitespace-nowrap">
                  {label}
                </span>
              </a>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
