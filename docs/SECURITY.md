# Security

Security posture for CoinFactory. Secret **values** are never reproduced in docs — only
categories and locations. The funnel is fully public — end users never authenticate
in v1; the only protected surface is the `/admin` panel (better-auth, v1 phase 2).
The public attack surface is small but fully open.

> Quick rule: secrets belong in env vars, never in source control. `.env` is git-ignored —
> never commit it, and never print its values into logs, commits, or tickets.

## Environment variables

| Surface | Rule |
|---|---|
| `.env` | Local only, gitignored, never committed; values never printed into logs, commits, or tickets. |
| `.env.example` | The reference shape — committed, **placeholder values only**. Add a key here whenever you add one to `.env`. |
| Access in code | Only through the t3-env validated module in `src/config/env/` — never raw `process.env`. Build fails on missing/invalid vars. |
| `NEXT_PUBLIC_*` | Ships to the browser. Never put a secret behind this prefix; review every addition. |

## Secrets posture

- No secrets in code, config files, or commits — env vars only. Greenfield: keep it that way;
  sibling repos paid for committed secrets.
- If a secret is ever exposed: **rotate** at the source → **move** to env → **purge** from git
  history (`git rm --cached` + history scrub if committed) → **audit** access logs.
- `removeConsole` keeps `error`/`warn` in production builds — never log env values or request
  payloads through those channels.

## Public funnel: the inquiry endpoint

The public oRPC surface is exactly three procedures: `inquiries.create` (persists an
`inquiries` row + its `inquiry_answers`, `inquiry_categories`, and `inquiry_files` rows,
stores uploaded objects in MinIO/S3, and triggers a best-effort post-commit notification
email — ADR-0005) — the only public write path — plus two reads: `questions.listActive`
(the wizard's active questions) and `categories.listActive` (the landing's business
categories). `inquiries.create` takes the answers to the active questions + optional project
link + email + WhatsApp number + optional picked categories + optional supporting documents
(up to 2 files, 5MB each, PDF/Word only), and requires at least one of description, document,
or category. Risks and controls:

- **Input validation** — every field zod-validated in the procedure (answers checked against
  the active questions and their options; URL format gate on the project link **only when
  non-empty** — the link is optional; email + phone formats; category ids deduped,
  length-capped, and verified against active rows **inside the insert transaction**). The
  wizard's client-side validation is UX only; the procedure is the boundary.
- **Spam / abuse** — layered controls ship in v1 (ADR-0005): a **pre-parse** body-size cap and
  per-IP rate limit at the reverse proxy / `/rpc` route handler (before oRPC parses the body),
  `serverActions.bodySizeLimit` for the action path, post-parse quotas in oRPC middleware
  (RpcContext carries the request IP/headers), and a honeypot field on the wizard. All body
  caps derive from **one shared byte budget (~12MB)** — proxy, `Content-Length` rejection,
  action limit, and the RPC body plugin never drift apart.
- **File uploads** — anonymous bytes are hostile by default. Enforce count/size caps (2 files,
  5MB each) and the allowlist (**PDF and Word only**) verified by magic-byte sniffing that
  proves document structure — OOXML WordprocessingML for `.docx`, a Word CFB stream for
  `.doc` — never extension, client MIME, or bare container headers. Objects live in
  private MinIO/S3 (Vercel Blob private for preview) behind the `Storage` interface — never
  public buckets or raw storage URLs. Downloads only via the admin-authenticated
  `/admin/files/[id]` route; notification emails carry those links, never attachments or
  storage URLs. Uploads happen outside the DB transaction with per-file orphan cleanup +
  compensating deletes (ADR-0005).
- **PII** — email and WhatsApp number are PII. Never log inquiry payloads (server, hooks, or
  error reporters); log inquiry IDs and validation outcomes only.
- **Enumeration** — inquiry reads and question CRUD are admin-only (behind better-auth);
  never expose a public read of submissions. The thank-you page confirms receipt without
  echoing stored data.
- **Errors** — return typed ORPCError validation messages; never leak SQL/Drizzle internals to
  the client.

## Admin surface

`/admin` (v1 phase 2) sits behind better-auth: every admin oRPC procedure
(question + category CRUD, inquiry list/review) runs behind the session middleware in
`src/server/rpc/middleware.ts` — no admin procedure ships unguarded. Auth is **admin-only**;
there is no end-user signup path, so any account-creation surface beyond admin provisioning
is a defect. The public surface stays exactly `inquiries.create` + `questions.listActive`
+ `categories.listActive` in v1.

## Database

- Postgres 17 runs in Docker (`docker-compose.yml`) with credentials that are **local-only
  throwaways** — fine in compose for dev, never reused in any deployed environment (deployed
  creds come from env/secret store).
- Don't expose the Postgres port beyond localhost in compose.
- All access goes through Drizzle parameterized queries; no string-built SQL.

## Dependencies

- `pnpm audit` before releases and when bumping pins; pnpm only.
- Versions are pinned (Drizzle v1 RC exactly, per ADR-0002) — bumps are deliberate diffs, not
  drift.
- New dependencies need a reason; this app's surface is one funnel — keep the tree small.

## Release checks

Run a secrets/env leak review, authz + input validation review, data-integrity + cache
invalidation review, and dependency/docker review after changes to the inquiry path, env
handling, caching, and before any release.
