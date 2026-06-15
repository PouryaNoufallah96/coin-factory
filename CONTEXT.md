# CoinFactory Tokenize

Swiss B2B lead-qualification funnel for real-world-asset tokenization: landing search →
6-step wizard → thank-you. One Next.js 16 app (oRPC + Drizzle/Postgres inside). This glossary
is deliberately thin — grow it as decisions crystallise.

## Domain

**Tokenization inquiry**:
The lead — one funnel run: an `inquiries` row (contact fields: email + WhatsApp, status,
timestamps) plus one `inquiry_answers` row per answered **radio/url** question (inquiry_id,
question_id, value), zero-or-more `inquiry_files` rows for attached supporting documents,
and zero-or-more business-category references picked on the landing.
The `contact` question writes **no** answer row — its values are the `inquiries.email` /
`inquiries.whatsapp` columns; the optional `url` question writes a row only when non-empty.
Persisted by the `inquiries` oRPC router on final Submit. The answer set follows whatever
questions were active — it is not a fixed 6-column shape.
_Avoid_: submission, application

**Wizard / Onboarding funnel**:
The question flow — the wizard steps within the single-page funnel at `/` — renders the **active questions from the DB** in
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
A file a founder optionally attaches on the landing — **PDF or Word (`.doc`/`.docx`) only** —
to describe their asset. Carried through the funnel and stored with the inquiry on Submit;
the review team opens it from the admin panel. **Max two per inquiry, max 5 MB each**; no
other formats (images, TXT, Markdown are not accepted).
_Avoid_: upload, asset (the asset is the real-world thing being tokenized, not the file)

**Submission email**:
The notification sent when an inquiry is submitted — a readable summary of the answers and
contact details plus secure, admin-authenticated links to any supporting documents (never
the documents as raw attachments or public links). Goes out as **one email addressed to
every notification recipient** (a configured company address serves as the fallback while
none are defined). Sent best-effort: the inquiry is captured and reviewable in `/admin`
even if the email fails.
_Avoid_: alert, receipt, confirmation

**Notification recipient**:
An admin-managed email address the submission email goes to — maintained in the admin
panel's settings, multi-entry, each submission email addressed to all of them at once.
Plain add/remove entries: no ordering, no soft-delete, no per-inquiry history (nothing
references a recipient — removing one simply stops future emails).
_Avoid_: subscriber, mailing list, watcher

**Business category**:
An admin-managed label a founder can pick on the landing (Luxury Hotel, Gold Mine,
AI Startup, …) — rendered as the pill badges under the search input, **multi-select**.
Lifecycle mirrors questions: ordered, enable/disable, soft-delete with restore; the funnel
shows only active, non-deleted rows. Selections are stored on the inquiry as multiple
references with a **label snapshot** taken at submit (a later rename never rewrites what a
founder picked). Categories carry **no relationship to questions** — they are lead metadata
for the review team, and never change which questions load.
_Avoid_: suggestion chip (the old hardcoded fill-the-input behavior), tag, industry

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
never log in. Question CRUD + inquiry list/review + app settings (notification recipients).

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
