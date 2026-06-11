# Feature flow — the canonical recipe

How every feature is built in this repo, end to end. Same layering as the
UltraBusiness webapp, with one structural difference: there is no HTTP BFF —
the backend lives in this app, so the api layer talks to **oRPC** instead of
fetch-wrappers over external services.

Order of work: **schema → db → procedures → server api → client api → actions → UI → pages → audit**.

## 0. Before writing anything

- Read the feature brief and the neighboring files on the paths you'll touch.
- Reuse before write: check `src/components/common`, `src/components/ui`, `src/lib`,
  `src/services`, `src/hooks`, and `src/features/shared` for existing pieces.

## 1. Zod schema — the single source of truth

`src/features/<feature>/schemas/<entity>.ts`

One zod schema per shape. The RHF form, the oRPC procedure `.input()`, and
the API types all derive from it. Never re-declare a shape twice.

## 2. DB — Drizzle

`src/server/db/schema/<feature>.ts` (+ barrel export in `schema/index.ts`)

- Tables: snake_case, uuid PKs (per PLAN S1), `timestamptz`, NUMERIC for money, pg enums for
  closed sets derived from one `as const` tuple; shared column builders from `schema/helpers.ts`.
- Relations only in the single `src/server/db/relations.ts` (RQB v2
  `defineRelations` — the per-table `relations()` API is forbidden).
- `pnpm db:generate` → commit the migration → `pnpm db:migrate`
  (`db:push` is for local throwaway iteration only).

## 3. Procedures — oRPC router

`src/server/rpc/routers/<feature>.ts`, composed in `routers/index.ts`

- Every procedure has zod `.input()` (and `.output()` when it feeds OpenAPI).
- Public reads (`questions.listActive`) = `publicProcedure`; everything admin — reads
  (`inquiries.list`) and mutations alike — goes behind the better-auth admin middleware.
- Mutations that forms call get `.actionable()` so they double as server
  actions.
- Errors are typed `ORPCError`s — never return success on partial failure
  (the inquiry funnel is the money path).

## 4. Server reads (RSC) — `api/server`

`src/features/<feature>/api/server/get-<things>.ts`

```ts
"use cache";
// call via the 'server-only' router client — never HTTP from the server
const data = await serverClient.<feature>.list(input);
cacheTag(<feature>Tag(...));
cacheLife("hours");
```

- Zero-HTTP rule: RSC and actions use `lib/orpc.server.ts`
  (`createRouterClient`); `RPCLink` is browser-only.
- Cache discipline: no per-user data inside `"use cache"`; pass IDs as arguments.

## 5. Client reads — `api/client`

`src/features/<feature>/api/client/use-<things>.ts`

- `orpc.<feature>.<proc>.queryOptions({ input })` from
  `@orpc/tanstack-query` (`src/lib/orpc.ts`), consumed with
  `useQuery`/`useSuspenseQuery`.
- URL-driven filters come from nuqs params (`src/lib/filter-params.ts` +
  a `params.ts` per feature shared by RSC pages and client hooks).
- Prefetch in RSC with `getQueryClient()` + hydrate when a client island
  needs the same data.

## 6. Mutations — actions

`src/features/<feature>/actions/<verb-entity>.ts`

- `'use server'` file re-exporting the `.actionable()` procedure (or a thin
  wrapper around it). No hand-rolled safe-action layer — oRPC's actionable
  procedures replace it.
- After a write: call the feature's single `update<Entity>Tags(id?)` fan-out helper in
  `src/features/<feature>/db/cache/` (it wraps `updateTag()` and composes the generic
  builders in `src/lib/cache-tags.ts`). Writes feeding dynamic (untagged) admin reads also
  call the server-side `refresh()` from `next/cache`. Never client `router.refresh()`.

## 7. UI — components

`src/features/<feature>/components/`

- Forms: RHF + zod resolver (`values:` not `defaultValues:` for edit forms; no
  `.default([])` in form schemas), submitting to the action from step 6.
- Tables (admin): the shared data-table kit in `src/components/data-table/` (a starter exists;
  slice 0008 extends it) with the 4-file pattern (table / columns / toolbar / action-bar).
- Visuals: cf tokens + Base UI `render` prop per DESIGN.md. No new colors, no
  animation libs — React `<ViewTransition>` only.
- React 19: no hand memoization with the Compiler on, no `forwardRef` in new/touched
  components, `Activity` only for state-preserving hidden UI, `useEffectEvent` only for
  non-reactive effect logic, and `cacheSignal()` only in server-only React `cache()` fetches.
- Actions: use oRPC `.actionable()` + `useAction`; do not port template `{ error, message }`
  envelopes. Add a shared `ActionButton` only after the same pending/error button composition
  repeats.

## 8. Pages — thin RSC composition

`src/app/<route>/page.tsx`

- Page = parse nuqs search params → prefetch/fetch via `api/server` →
  compose feature components. Long-lived `"use cache"` public reads render directly when they
  belong to the initial shell; otherwise put only the smallest owning section under
  `<Suspense>` with a matching skeleton. Uncached request-time/admin reads use the same
  smallest-boundary rule, wrapped in the fetcher/error-boundary helpers
  (`src/components/fetcher/`).
- Add route `error.tsx` only when the segment has a real failure surface; for repeated server
  async sections prefer `ServerFetchResult` + `ComponentErrorBoundary` before introducing a
  broader `AsyncSection` wrapper.
- `generateMetadata` per page; run `pnpm typegen` after adding routes.

## 9. Audit

- `pnpm validate` green (format + typecheck + lint + react-doctor + build) — the gate.
- Anything touching env/cache/submission needs focused review against [SECURITY.md](../SECURITY.md).

## Layer map (UB webapp → CoinFactory)

| UltraBusiness webapp | CoinFactory equivalent |
|---|---|
| `config/http/http-service.server.ts` (fetch to microservices) | `lib/orpc.server.ts` router client (zero HTTP) |
| `app/api/*` BFF route handlers | `app/rpc/[[...rest]]/route.ts` (single oRPC mount) |
| `api/client` fetch + React Query hooks | `api/client` oRPC `queryOptions` hooks |
| `lib/safe-action.ts` + 3-file action folders | oRPC `.actionable()` procedures + thin `'use server'` action files |
| `features/<f>/db/cache` tag helpers | Same shape — per-feature `db/cache/` helpers (incl. the `update<Entity>Tags` fan-out) composing `src/lib/cache-tags.ts` builders |
| shared external provider clients | `src/services/<provider>` (`server-only` for server providers); feature orchestration remains in `src/features/<feature>` |
| fetcher, data-table, forms, nuqs, t3-env, feature slicing | Pattern-compatible, adapted to CoinFactory's single app, Base UI, dark cf tokens, and no i18n |
