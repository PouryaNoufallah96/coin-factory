---
name: CoinFactory Tokenize
description: Premium Swiss Web3 tokenization onboarding — dark concierge aesthetic
colors:
  canvas-start: "#232832"
  canvas-end: "#434954"
  surface-dark: "#232832"
  surface-muted: "rgba(35,40,50,0.4)"
  accent-cream: "#FFF2D1"
  accent-cream-bright: "#FFF4D7"
  text-primary: "#FFFFFF"
  text-on-accent: "#232832"
  border-muted: "#8F8F8F"
  chip-inactive-bg: "rgba(255,255,255,0.08)"
  chip-active-bg: "rgba(255,242,209,0.4)"
  glow-cream: "rgba(255,250,237,0.24)"
  progress-inactive: "rgba(255,242,209,0.2)"
  error: "#EF4444"
  text-on-error: "#FFFFFF"
typography:
  hero-subline:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: 300
    lineHeight: 1.2
  hero-headline:
    fontFamily: Inter
    fontSize: 96px
    fontWeight: 700
    lineHeight: 1.1
  question:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 300
    lineHeight: 1.3
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  field-label:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: 300
    lineHeight: 1.3
  cta:
    fontFamily: Comfortaa
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1
  logo:
    fontFamily: Parkinsans
    fontSize: 27px
    fontWeight: 400
    lineHeight: 1
  footer-legal:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.3
rounded:
  pill: 9999px
  row: 60px
  panel: 40px
  card: 16px
  segment: 8px
  alert: 8px
spacing:
  unit: 8px
  page-x: 100px
  header: 96px
  footer: 80px
  content-width: 720px
  field-width: 520px
  section-gap: 56px
  option-gap: 20px
motion:
  feedback: 140ms
  content: 260ms
  easing: 'cubic-bezier(0.2, 0, 0, 1)'
components:
  search-hero:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.accent-cream}"
    rounded: "{rounded.row}"
    height: 80px
  chip-inactive:
    backgroundColor: "{colors.chip-inactive-bg}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: 8px
  chip-active:
    backgroundColor: "{colors.chip-active-bg}"
    textColor: "{colors.text-on-accent}"
    rounded: "{rounded.pill}"
    padding: 8px
  radio-row-inactive:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.row}"
    height: 72px
  radio-row-active:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.accent-cream-bright}"
    rounded: "{rounded.row}"
    height: 72px
  button-primary:
    backgroundColor: "{colors.accent-cream-bright}"
    textColor: "{colors.text-on-accent}"
    typography: "{typography.cta}"
    rounded: "{rounded.pill}"
    height: 48px
  stepper-segment:
    backgroundColor: "{colors.progress-inactive}"
    rounded: "{rounded.segment}"
    height: 8px
  file-card:
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    height: 68px
  alert-error:
    backgroundColor: "{colors.error}"
    textColor: "{colors.text-on-error}"
    rounded: "{rounded.alert}"
    height: 56px
---

## Overview

A Swiss private-bank onboarding room at night. CoinFactory Tokenize is the
intake funnel for founders tokenizing real-world assets — hotels, mines,
factories, startups. One question per screen, a single centered column, a soft
cream spotlight pooling on a charcoal gradient. It must read as a private
consultation with an institution, never as a consumer crypto exchange, a DeFi
dashboard, or a SaaS signup.

## Where this lives in the repo

- **Tokens** — the `--cf-*` custom properties and the shadcn variable map
  (`--primary: #fff2d1`, `--radius: 9999px`, …) live in `src/app/globals.css`. Never hardcode a hex that exists as a token.
- **Components** — built as shadcn/ui on **Base UI** primitives in `src/components/ui/`
  (`render` prop, never Radix `asChild`): search/fields → `Input`, chips → `Badge`,
  option rows → `RadioGroup`, CTA/back → `Button`, alert → `sonner`/custom surface;
  the stepper and file cards are custom divs.
- **Fonts** — Inter, Parkinsans, Comfortaa, IBM Plex Sans via `next/font/google`, mapped to
  `--cf-font-*` vars. Max two families per screen.
- **Motion** — screen changes use React `<ViewTransition>` (the view-transition flag is on).
- **Full system** — this file is the source of truth for token CSS, brand assets,
  component contracts, and per-screen visual decisions. Keep production UI aligned with it
  before changing `src/app/globals.css`.

## Colors

A single-accent dark system: charcoal canvas, champagne cream as the only
highlight.

- **Canvas** ({colors.canvas-start} → {colors.canvas-end}): full-page 136°
  gradient. Never pure black.
- **Surface dark** ({colors.surface-dark}): active inputs and selected radio
  rows — the same charcoal as the canvas start, lifted by border and glow, not
  by lightness.
- **Surface muted** ({colors.surface-muted}): unselected option cards. Depth by
  opacity, not by shadow.
- **Accent cream** ({colors.accent-cream}): logo, active borders, progress,
  CTA. The sole accent — never blue, green, or purple, anywhere.
- **Error red** ({colors.error}): one exception, one place — the alert banner
  raised when a required step is submitted unanswered. Never a fill, border,
  icon, or text color anywhere else.
- **Glow cream** ({colors.glow-cream}): a 100–200px blur reserved for the one
  active/focused element on screen.
- **Text** is white on dark ({colors.text-primary}); charcoal inside cream
  surfaces ({colors.text-on-accent}).

## Typography

Inter carries the UI. Parkinsans exists only as the lowercase logo wordmark.
Comfortaa Bold appears only on CTA labels ("Next", "Submit"). IBM Plex Sans
appears only in the footer legal line. Never more than two families on a
screen.

- **Hero:** a Light 36px subline over a Bold 96px headline. The headline is
  charcoal-colored type wearing a cream text-shadow, so it glows out of the
  spotlight instead of sitting on it.
- **Questions:** Inter Light 32px, centered, one sentence, ends in a question
  mark.
- **Options and chips:** Inter Regular 16–20px, sentence case.
- **Don't** use display serifs, italic standfirsts, or all-caps UI text.

## Layout

Single centered column: ~720px max content, 520px for option and field stacks,
100px page padding (clamping down on small viewports), 96px header, 80px
footer, 8px base grid. One focal element per screen. Wizard screens carry a
six-segment progress bar (40×8px pills) centered above the question.

## Elevation & Depth

No Material shadows, no stacked cards, no glassmorphism. Depth is light:
the background spotlight, the cream glow on the active element, 1px borders
(cream = active, {colors.border-muted} = inactive), and opacity layers for
everything at rest. The primary CTA alone carries a faint dark shadow to
ground it on the bright pool.

## Shapes

Everything interactive is a capsule: search ({rounded.row}), radio rows
({rounded.row}), chips and CTAs ({rounded.pill}), progress segments
({rounded.segment}). Three rectangles are allowed, all non-interactive
surfaces: the expanded search panel ({rounded.panel}), attached-file cards
({rounded.card}), and the error alert ({rounded.alert}). No sharp corners
anywhere.

## Motion

Calm and mechanical. {motion.feedback} for hover/press, {motion.content} for
selection and screen changes, always {motion.easing}. Screen changes are a
short fade with an 8px rise. Nothing bounces, overshoots, loops, or lingers.
Respect `prefers-reduced-motion`.

## Screens

| Route | Screen | Focal element |
|---|---|---|
| `/` | Landing | Hero search/upload pill + 7 suggestion chips; social footer |
| `/onboarding/1..4` | Question steps | One radio-row stack, 6-segment stepper, Back + Next |
| `/onboarding/5` | Project link | Single pill TextField "Link"; optional empty value passes |
| `/onboarding/6` | Contact | Email + WhatsApp fields; Back + Submit |
| `/thank-you` | Confirmation | Halo "Thank You" headline; no CTA |

Shared chrome everywhere: 96px header (logo lockup left, decorative hamburger right),
charcoal gradient + cream spotlight canvas. Wizard CTAs stay enabled; submitting an
unanswered required step raises the top error alert.

### Hero search
Dark pill, 80px tall, cream value text. Plus glyph left (attach a document),
target glyph right (go). Resting state already glows softly; focus adds the
cream border and the full glow. Placeholder names concrete assets ("e.g Oil
Refinery in Indonesia, Hotel in Dubai, Gold Mine..."). With attachments the
pill relaxes into a {rounded.panel} panel: a row of file cards above the input row.

### Attached-file card
241×68, {rounded.card}, 1px gray border. A 48px cream tile (radius 8) holds
the charcoal document glyph; file name in white over its type in gray; a gray
remove-circle sits top-right.

### Suggestion chips
Pill badges under the search. Inactive = translucent white + gray border;
active = cream-tinted fill + charcoal text.

### Radio option rows
Full-width pills, 72px tall, leading radio dot. Selected: dark surface, cream
border, glow, cream-bright label, filled dot. Unselected: muted surface, gray
border, white label.

### Primary CTA
Cream pill, 160×48px, charcoal Comfortaa Bold label. Only ever "Next" or
"Submit". It stays enabled — an unanswered required Next/Submit raises the
error alert instead of disabling.

### Back button
Ghost pill, same geometry, paired left of Next in a 520px space-between row.
Transparent with a 1px cream outline and a charcoal label — it sits on the
bright lower spotlight.

### Error alert
A 56px {colors.error} bar, {rounded.alert}, overlaid across the top of the
page (40px margins): white warning triangle, Inter Medium 16px white message
("You must answer all questions to submit."), dismiss ×. The system's only
red, and its only top-anchored element.

### Form fields
Light Inter label above a dark pill input. Used for link, email, and WhatsApp
phone number. Placeholders echo the label ("Email", "WhatsApp Phone number",
"Link"). Once a field holds a value, a small gray × appears inside the pill
to clear it.

## Do's and Don'ts

- **Do** keep one question per screen with generous vertical space.
- **Do** use the cream glow only on the currently active element — its
  scarcity is what makes it read as attention.
- **Do** default to dark on every screen and keep WCAG AA contrast
  (cream on charcoal, charcoal on cream).
- **Don't** add sidebars, dashboards, charts, tickers, or price widgets.
- **Don't** use blue/purple accents, neon, glassmorphism, or gradient buttons.
- **Don't** use `{colors.error}` anywhere except the unanswered-step alert.
- **Don't** use sharp corners — pills everywhere.
- **Don't** add illustrations, stock photos, mascots, or emoji.
- **Don't** let it feel like a consumer crypto wallet.
