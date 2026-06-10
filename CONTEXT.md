# CoinFactory Tokenize

Swiss B2B lead-qualification funnel for real-world-asset tokenization: landing search →
6-step wizard → thank-you. One Next.js 16 app (oRPC + Drizzle/Postgres inside). This glossary
is deliberately thin — grow it as decisions crystallise.

## Domain

**Tokenization inquiry**:
The lead — one funnel run: an `inquiries` row (contact fields: email + WhatsApp, status,
timestamps) plus one `inquiry_answers` row per answered **radio/url** question (inquiry_id,
question_id, value) and zero-or-more `inquiry_files` rows for attached supporting documents.
The `contact` question writes **no** answer row — its values are the `inquiries.email` /
`inquiries.whatsapp` columns; the optional `url` question writes a row only when non-empty.
Persisted by the `inquiries` oRPC router on final Submit. The answer set follows whatever
questions were active — it is not a fixed 6-column shape.
_Avoid_: submission, application

**Wizard / Onboarding funnel**:
The question flow at `/onboarding/1..N` — renders the **active questions from the DB** in
sort order (6 seeded in v1), one per screen, segmented progress bar. Founders move with
**Back / Next** and may navigate freely backward and forward to review or change answers
(answers persist across steps). CTAs stay **enabled**; pressing Next/Submit on an unanswered
required step raises the top `--cf-error` alert instead of disabling the button — the funnel
will not finalise until every required step is complete. The progress segments are a
non-clickable indicator, not jump targets.
_Avoid_: survey, quiz

**Question**:
An admin-managed wizard step definition — one `questions` row: sort order, text, kind enum
(radio | url | contact), options, an `active` flag, and a `deleted_at` marker. The funnel
renders only rows that are active and not deleted; admins create / edit / reorder /
enable-disable / delete them at `/admin`. **Delete is a soft-delete** (sets `deleted_at`) so a
past inquiry's answers keep their original question text — rows are never physically removed;
**enable-disable** toggles `active` for a reversible funnel hide. NOT a hardcoded constant.
_Avoid_: survey item, field config

**Supporting document**:
A file a founder optionally attaches on the landing — PDF, Word, TXT, Markdown, or image — to
describe their asset. Carried through the funnel and stored with the inquiry on Submit; the
review team opens it from the admin panel. Max five per inquiry.
_Avoid_: upload, asset (the asset is the real-world thing being tokenized, not the file)

**Submission email**:
The notification the company receives when an inquiry is submitted — a readable summary of the
answers and contact details plus secure, admin-authenticated links to any supporting documents
(never the documents as raw attachments or public links). Sent best-effort: the inquiry is
captured and reviewable in `/admin` even if the email fails.
_Avoid_: alert, receipt, confirmation

**Suggestion chip**:
A pill badge under the landing search (Luxury Hotel, Gold Mine, AI Startup, …). Clicking one
fills the search input; it does not navigate.

**Project stage**:
Q1 answer — Idea Stage / MVP / Active Business / Established Business.

**Tokenization goal**:
Q2 answer — Fundraising / Community Growth / Customer Loyalty / Rewards System / Asset
Tokenization / Others.

**Fee allocation**:
Q4 answer — whether the founder would allocate part of the token supply to CoinFactory
instead of paying full cash fees (Yes / No / Open to discussion).

**Admin panel**:
The `/admin` route group in the same app (v1 phase 2, slices 0007/0008) — CF design system
(dark cream-on-charcoal, data-table kit), behind better-auth, **admin-only**: end users
never log in. Question CRUD + inquiry list/review.

**CoinFactory AG**:
The Swiss company behind the platform — the brand in the footer legal line. **CoinFactory**
(or CoinFactory Tokenize) in this repo means **this app**, the intake funnel — not the
company, not a token minter.

## Framework / platform

**oRPC procedure**:
A typed unit in `src/server/rpc/routers/` — the only API surface (mounted at
`src/app/rpc/[[...rest]]/route.ts`, no Hono; ADR-0001). Mutations expose `.actionable()`
server actions; RSC calls go through the `'server-only'` `createRouterClient`.

**Feature module**:
A `src/features/<feature>/` slice: `schemas/` (the Zod contract shared by the oRPC router
and RHF forms), `actions/`, `api/{client,server}/`, `components/`, `hooks/`, `db/cache/`
(cache-tag helpers — the invalidation seam).

**Drizzle v1 RC**:
The ORM (ADR-0002): RQB v2 `defineRelations` in one relations file, validators from
`drizzle-orm/zod`, committed migrations via `generate` + `migrate`.
_Avoid_: the per-table `relations()` API (v0 — forbidden here)
