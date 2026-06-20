import { captureRouterTransitionStart, init } from "@sentry/nextjs";

const sentryDsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  "https://80fce68bb29be5303c1ed545372d6778@o4510492345368576.ingest.de.sentry.io/4511585195327583";

init({
  dsn: sentryDsn,
  enabled: process.env.NODE_ENV === "production" && Boolean(sentryDsn),
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
  tracePropagationTargets: ["localhost", /^\//],
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,
});

export const onRouterTransitionStart = captureRouterTransitionStart;
