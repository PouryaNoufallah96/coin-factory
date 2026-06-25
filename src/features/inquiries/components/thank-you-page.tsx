import { ThankYouConfetti } from "./thank-you-confetti";

export function ThankYouPage() {
  return (
    <section className="relative flex flex-1 items-start justify-center px-(--cf-page-x) pt-(--cf-thank-you-content-top) pb-8">
      <ThankYouConfetti />
      <div className="relative z-10 flex w-full max-w-(--cf-thank-you-w) animate-[enter-fade-up_0.6s_cubic-bezier(0.2,0,0,1)_both] flex-col items-center gap-(--cf-thank-you-stack-gap) text-center">
        <h1 className="text-(length:--cf-text-hero) font-bold text-cf-charcoal-900 text-shadow-(--cf-hero-shadow) leading-none">
          Thank You
        </h1>
        <p className="text-(length:--cf-text-thank-you-sub) max-w-(--cf-thank-you-w) font-light text-cf-cream leading-snug sm:font-thin">
          Your submission has been received successfully
        </p>
        <p className="text-(length:--cf-text-lg) max-w-(--cf-thank-you-body-w) font-light text-cf-text-primary leading-body">
          Our team will review your project and contact you within 48 hours.
        </p>
      </div>
    </section>
  );
}
