export function AboutPage() {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-start overflow-hidden px-(--cf-page-x) pt-(--cf-landing-content-top) pb-8">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-1 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/brand/about-back.svg')",
        }}
      />

      <div className="cf-content-container relative z-10 flex animate-[enter-fade-up_0.55s_cubic-bezier(0.2,0,0,1)_both] flex-col gap-10">
        <div className="flex flex-col items-center gap-(--cf-hero-stack-gap) text-center">
          <h1 className="text-(length:--cf-text-hero-lg) font-bold text-cf-charcoal-900 text-shadow-(--cf-hero-shadow) leading-none">
            About Us
          </h1>
        </div>

        <div className="flex flex-col gap-6 text-center">
          <p className="font-light text-cf-text-primary text-lg leading-(--cf-leading-body)">
            CoinFactory is a tokenization company, helping businesses transform
            assets, communities, products, and ventures into blockchain-powered
            economies.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PILLARS.map(({ label, value }) => (
            <div
              className="flex flex-col items-center gap-2 rounded-(--cf-radius-panel) border border-cf-border-muted bg-cf-surface-muted p-6 text-center"
              key={label}
            >
              <span className="text-(length:--cf-text-hero) font-bold text-cf-cream leading-none">
                {value}
              </span>
              <span className="text-(length:--cf-text-base) font-light text-cf-text-primary">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PILLARS = [
  { value: "50+", label: "Assets Tokenized" },
  { value: "$2B+", label: "Assets Under Management" },
  { value: "30+", label: "Countries Reached" },
];
