import Image from "next/image";
import { PageBackdrop } from "@/components/common/page-backdrop";

const CARDS = [
  {
    title: "Who We Are",
    description:
      "CoinFactory is a Switzerland-based tokenization company located in Zug, helping businesses transform assets, communities, products, and ventures into blockchain-powered economies.",
    image: "/about/world.svg",
    imageAlt: "World map illustration",
  },
  {
    title: "What We Do",
    description:
      "We evaluate, design, and launch tokenization opportunities. From real-world assets and businesses to digital communities and platforms, we help founders build sustainable token economies.",
    image: "/about/what.svg",
    imageAlt: "What we do illustration",
  },
  {
    title: "Our Approach",
    description:
      "We do more than create tokens. We identify opportunities, evaluate potential, and support the development of long-term token ecosystems.",
    image: "/about/approach.svg",
    imageAlt: "Approach illustration",
  },
];

export function AboutPage() {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-start overflow-hidden">
      <PageBackdrop src="/brand/about-back.svg" />

      <div className="relative z-10 flex animate-[enter-fade-up_0.55s_cubic-bezier(0.2,0,0,1)_both] flex-col gap-11">
        <div className="flex flex-col items-center gap-(--cf-hero-stack-gap) text-center">
          <h1 className="text-(length:--cf-text-hero-lg) font-bold text-cf-charcoal-900 text-shadow-(--cf-hero-shadow) leading-none">
            About Us
          </h1>
        </div>

        <div className="flex flex-col gap-6 text-center">
          <p className="font-light text-cf-text-primary text-xl leading-(--cf-leading-body)">
            CoinFactory is a tokenization company, helping businesses transform
            assets,
            <br /> communities, products, and ventures into blockchain-powered
            economies.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {CARDS.map(({ title, description, image, imageAlt }) => (
            <div
              className="flex max-w-90 flex-col overflow-hidden rounded-(--cf-radius-panel) border border-cf-border-muted bg-cf-cream-soft/24"
              key={title}
            >
              <div className="w-full overflow-hidden">
                <Image
                  alt={imageAlt}
                  className="h-full w-full object-cover"
                  height={247}
                  src={image}
                  width={380}
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
      </div>
    </section>
  );
}
