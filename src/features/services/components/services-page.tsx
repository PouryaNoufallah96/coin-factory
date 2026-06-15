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

      <div className="relative z-10 flex animate-[enter-fade-up_0.55s_cubic-bezier(0.2,0,0,1)_both] flex-col gap-11">
        <div className="flex flex-col items-center gap-(--cf-hero-stack-gap) text-center">
          <h1 className="text-(length:--cf-text-hero-lg) font-bold text-cf-charcoal-900 text-shadow-(--cf-hero-shadow) leading-none">
            Services
          </h1>
        </div>
      </div>
    </section>
  );
}
