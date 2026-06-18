# Review Index

<!-- rz-review:generated:start -->
## Purpose

This file maps the Project Knowledge used by the Review System. During review, load this file first, then load the most relevant referenced docs for the changed paths.

## Project Snapshot

- Project: coin-factory
- Kinds: HTTP service, Static web UI
- Main languages:
- TypeScript: 95 files
- TypeScript React: 79 files
- Markdown: 19 files
- JSON: 8 files
- JavaScript: 1 files
- CSS: 1 files

## Context Docs

- docs/review/architecture.md
- docs/review/conventions.md
- docs/review/testing.md
- docs/review/security.md
- docs/review/workflows.md
- docs/review/domain.md
- docs/review/risk-map.md
- docs/review/backend.md
- docs/review/frontend.md

## Important Source Areas

- .husky
- docs
- drizzle
- public
- src

## Existing Documentation

- CONTEXT.md
- CONTRIBUTING.md
- DESIGN.md
- README.md
- docs/ARCHITECTURE.md
- docs/REVIEW_GUIDE.md
- docs/REVIEW_INDEX.md
- docs/SECURITY.md
- docs/playbooks/feature-flow.md
- docs/review/architecture.md
- docs/review/backend.md
- docs/review/conventions.md
- docs/review/domain.md
- docs/review/frontend.md
- docs/review/risk-map.md
- docs/review/security.md
- docs/review/testing.md
- docs/review/workflows.md
- src/services/README.md

## Important Files

- .env.example
- Dockerfile
- README.md
- package.json

## Available Commands

- `dev`: `next dev`
- `build`: `next build --turbopack`
- `email:dev`: `email dev --dir src/features/inquiries/email/templates --port 3001`
- `start`: `next start`
- `prepare`: `husky`
- `format`: `biome check --write .`
- `lint`: `biome check .`
- `react-doctor`: `pnpm --silent dlx react-doctor@latest -y --scope full --no-dead-code --verbose --blocking warning --no-score .`
- `react-doctor:staged`: `pnpm --silent dlx react-doctor@latest -y --staged --no-dead-code --verbose --blocking warning --no-score .`
- `typecheck`: `tsc --noEmit`
- `typegen`: `next typegen`
- `validate`: `pnpm format && pnpm typecheck && pnpm lint && pnpm react-doctor && pnpm build`
- `db:generate`: `drizzle-kit generate`
- `db:migrate`: `drizzle-kit migrate`
- `db:push`: `drizzle-kit push`
- `db:studio`: `drizzle-kit studio`
<!-- rz-review:generated:end -->

<!-- rz-review:human:start -->
## Human Notes

Add navigation notes that the scanner cannot infer, such as domain boundaries, owner expectations, or files that reviewers should always read first.
<!-- rz-review:human:end -->
