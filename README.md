# CoinFactory Tokenize

> CoinFactory: premium Swiss Web3 tokenization platform with a dark onboarding web app for
> founders who want to tokenize real-world assets (hotels, mines, factories, startups). The
> UI feels like a private-membership fintech concierge — not a crypto exchange. Centered
> single-focus screens, spotlight glow on dark charcoal gradients, champagne-cream accents,
> pill-shaped inputs and CTAs, 6-step wizard flow (landing search → project stage →
> tokenization goal → investment interest → fee structure → project link → contact → thank you).

A **lead-qualification funnel** for CoinFactory AG: a founder describes an asset, answers 6
questions, leaves contact details; the team reviews and follows up within 48 hours. That funnel plus a
v1 admin panel (`/admin`, better-auth admin-only: question CRUD, inquiry review) is the
whole product — no exchange, no wallet, no end-user dashboard, no self-serve minting.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, typedRoutes, cacheComponents/PPR, React Compiler) + React 19 |
| API | oRPC mounted directly at `src/app/rpc/[[...rest]]/route.ts` — no Hono, no separate backend |
| ORM / DB | Drizzle v1 RC on Postgres 17 (Docker) |
| UI | Tailwind v4 (CSS-first) + shadcn/ui on **Base UI** primitives, dark-only |
| Design tokens | `--cf-*` custom props from the CoinFactory Design System — see [DESIGN.md](DESIGN.md) |
| Validation | Zod v4 (shared by oRPC contracts and React Hook Form) |
| Tooling | pnpm + Biome 2.x (Ultracite presets) — no eslint, no prettier |
| Issues | Linear (`Rz-tech` / `CoinFactory`) |

## Getting started

```bash
docker compose up -d     # Postgres 17 (healthcheck + volume)
pnpm install             # pnpm only — bun/npm/yarn are blocked by hook
pnpm dev                 # http://localhost:3000
```

Validate before any commit:

```bash
pnpm validate            # format (Biome) + typecheck + lint + react-doctor + build
```

## Structure

```
src/app/         routes: / → /onboarding/1..6 → /thank-you · /admin; rpc/[[...rest]]/route.ts
src/server/      Drizzle schema + oRPC routers (never imports from features/components)
src/features/    feature-sliced modules: schemas, actions, api, components, db/cache
src/components/  ui (shadcn) + common + layout
docs/            architecture and security notes
```

## Docs

- [CONTRIBUTING.md](CONTRIBUTING.md) — conventional commits, validation gate, house rules
- [DESIGN.md](DESIGN.md) — design tokens + per-screen specs (dark concierge aesthetic)
- [CONTEXT.md](CONTEXT.md) — domain glossary
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/SECURITY.md](docs/SECURITY.md)
