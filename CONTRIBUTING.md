# Contributing to CoinFactory Tokenize

How we work on this repo: commit messages, validation, and the house rules that differ from
typical Next.js projects. For architecture and where code lives, start with
[README.md](README.md), [CONTEXT.md](CONTEXT.md), and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## House rules (read first)

| Topic | Rule |
|---|---|
| Package manager | **pnpm only** — never bun/npm/yarn |
| Formatter/linter | **Biome 2.x (Ultracite presets)** — there is NO eslint and NO prettier in this repo; do not add them |
| Formatting | **IS enforced** — `pnpm format` (`biome check --write .`) before every commit; unformatted code fails `pnpm validate` |
| Validation gate | `pnpm validate` = format + typecheck + lint + react-doctor + build — green before "done" |
| Secrets | Never commit `.env` — it stays git-ignored; document every key by name in `.env.example` — see [docs/SECURITY.md](docs/SECURITY.md) |

---

## Commit messages

We follow **[Conventional Commits](https://www.conventionalcommits.org/)**.

### Format

```
<type>(<optional scope>): <description>

<optional body>

<optional footer>
```

Multi-line example:

```bash
git commit -m "feat(funnel): add fee-allocation step" \
  -m "Adds /onboarding/4 radio step with Yes/No/Open to discussion." \
  -m "Closes RZ-12"
```

### Subject line rules

| Part | Rule |
|------|------|
| **type** | Required — see [Types](#types) |
| **scope** | Optional — logical area (see [Scopes](#scopes)) |
| **description** | Required — imperative, present tense (`add`, not `added`); lowercase first letter; no trailing period |
| **breaking change** | Append `!` before `:` and describe impact in the footer |

### Types

| Type | When to use |
|------|-------------|
| `feat` | New or changed user-visible behavior — a screen, a step, an oRPC procedure, a validation rule |
| `fix` | Bug fix for behavior a prior `feat` introduced |
| `refactor` | Restructure without changing behavior |
| `perf` | Performance improvement (bundle, waterfalls, caching) |
| `style` | Formatting/whitespace only — no behavior change |
| `test` | Add or fix tests |
| `docs` | Documentation only (root MDs, `docs/`, ADRs, plans) |
| `build` | Dependencies, next.config, tsconfig, biome.jsonc, drizzle.config |
| `ops` | Docker, deploy, CI (when it exists) |
| `chore` | Housekeeping that fits nothing above |

Which type? Work down: bug fix → `fix`; behavior change → `feat`; perf → `perf`; restructure
→ `refactor`; formatting → `style`; tests → `test`; docs → `docs`; deps/tooling → `build`;
infra → `ops`; else → `chore`.

### Scopes

Optional but useful. Prefer a logical module, never an issue ID.

| Scope | Typical use |
|-------|-------------|
| `funnel` | Landing, wizard steps, thank-you — routes and feature modules |
| `design-system` | Tokens, `globals.css`, shadcn components, DESIGN.md |
| `server` | `src/server/` — context, middleware, services |
| `db` | Drizzle schema, relations, migrations, docker-compose |
| `rpc` | oRPC routers/procedures, the rpc route handler |
| `deps` | Dependency bumps |

Reference Linear issues in the description or footer (`Closes RZ-12`), not as the scope.

### Examples (this repo)

```
feat(funnel): add landing suggestion chips
feat(rpc): add inquiries.create procedure with rate limit
fix(funnel): gate Next on URL validity in step 5
refactor(server): extract inquiry status enum
perf(funnel): move stepper into the PPR shell
docs: add ADR for drizzle v1 rc
build(deps): pin drizzle-orm@beta
```

### Versioning (if we semver releases)

Breaking (`!` / `BREAKING CHANGE:`) → major · `feat`/`fix` → minor · else → patch.

---

## Branches and reviews

The repo lives on GitLab (`origin` → `gitlab.com/tokenize1/app`); the target branch is
`main`.

1. **Branch** — short, kebab-case, type-prefixed: `feat/wizard-shell`, `fix/q5-url-gate`.
2. **Keep changes focused** — one logical change; split large features into reviewable
   vertical slices.
3. **`pnpm validate` must pass** before a branch is considered mergeable.

---

## Local validation

Before considering any change done:

```bash
pnpm validate          # = pnpm format && pnpm typecheck && pnpm lint && pnpm react-doctor && pnpm build
```

After adding/renaming routes, run `pnpm typegen` first — typedRoutes makes stale route types
a typecheck lie. DB changes additionally need `pnpm db:generate` and the migration committed.

---

## Conventions (summary)

Load-bearing detail lives in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and
[CONTEXT.md](CONTEXT.md).

| Topic | Convention |
|-------|------------|
| API | oRPC mounted directly — no Hono, no extra HTTP layer |
| ORM | Drizzle v1 RC — `defineRelations`, `drizzle-orm/zod`, committed migrations |
| UI | shadcn on Base UI (`render` prop, never `asChild`); `--cf-*` tokens; dark-only, pills |
| Mutations | `.actionable()` procedures + tag invalidation via `features/*/db/cache/` |
| Issues | Linear, team `Rz-tech`, project `CoinFactory` |

When adding a feature, keep the same vertical order: schema → oRPC procedure → feature
module → page.

---

## References

- [Conventional Commits specification](https://www.conventionalcommits.org/)
