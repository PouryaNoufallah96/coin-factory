import Link from "next/link";

export default function OnboardingStepNotFound() {
  return (
    <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-(--cf-page-x)">
      <div className="cf-field-container flex flex-col items-center gap-5 text-center">
        <p className="font-light text-2xl text-cf-text-primary leading-tight sm:text-3xl">
          This step is not available.
        </p>
        <Link
          className="inline-flex h-(--cf-cta-h) w-full items-center justify-center rounded-full bg-cf-cream-bright font-cta text-cf-text-on-accent shadow-(--cf-cta-shadow) transition-[background-color,transform] duration-(--cf-dur-feedback) ease-(--cf-ease) hover:bg-cf-cream active:scale-[0.97] sm:w-(--cf-cta-w)"
          href="/"
          transitionTypes={["nav-back"]}
        >
          Back
        </Link>
      </div>
    </section>
  );
}
