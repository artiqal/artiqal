# Artiqal Design System

This document records the design system currently implemented in the repository. It is descriptive, not aspirational. Where the code has competing values, the inconsistency is called out.

## Product direction

The clinician interface is designed as an adult clinical SaaS workspace: calm, legible, restrained, and work-focused. Shared pages favour predictable navigation, stable card geometry, explicit controls, muted glass surfaces, domain accents, and compact scanning over decorative marketing composition.

The public landing page has a separate visual implementation in `frontend/src/pages/LandingPage.css`. Do not infer clinician-shell rules from the landing page.

## Canonical clinician shell

`frontend/src/components/HubShell.jsx` owns the shell structure:

- `hub-app-shell`: rounded outer glass frame.
- `hub-left-rail`: brand and sidebar column.
- `hub-app-column`: the sole main scroll container.
- `hub-topbar`: fixed desktop top pill.
- `hub-content-stage`: shared page-content owner.

The current shell values live in `frontend/src/index.css`:

- Outer frame: viewport inset `12px`, radius `30px`, and a translucent layered background with `36px` backdrop blur.
- Expanded rail: `236px`; collapsed rail: `96px`.
- Shell grid gap: `14px`.
- Header row: `70px`; top pill: `56px` high.
- Desktop top pill becomes fixed at `min-width: 961px`.

The brand and top pill share the header row. The brand uses `--hub-header-offset` plus `--hub-brand-optical-offset`; do not move it page by page.

### Content frame and top pill alignment

The canonical inline boundaries are calculated in `.hub-app-column`:

- `--hub-content-frame-start`
- `--hub-content-frame-end`
- `--hub-topbar-frame-start`
- `--hub-topbar-right-inset`

Every `.clinician-page` inside `.hub-content-stage` uses the content-frame start/end margins. Breadcrumbs, search controls, carousels, grids, setup pages, and panels should align through that shared wrapper instead of introducing separate page gutters.

The top pill is a single visible rounded surface. `hub-topbar-safe-occluder` covers only the small header-safe region above it on desktop. Do not add a full-width fade, frost strip, or rectangular mask behind the pill.

## Activity cards

`frontend/src/components/ActivityCard.jsx` is the canonical shared activity-card component. `.activities-card-grid` and the `--activity-card-*` custom properties in `frontend/src/index.css` are the sizing source of truth.

Current base tokens:

| Token | Current value |
| --- | --- |
| `--activity-card-columns` | `5` |
| `--activity-card-width` | `205px` fallback/base |
| `--activity-card-height` | `320px` |
| `--activity-card-media-height` | `118px` |
| `--activity-card-content-padding` | `18px 18px 8px` |
| `--activity-card-footer-height` | `44px` |
| `--activity-card-gap` | `14px` |

At desktop widths (`min-width: 1101px`), the grid uses five equal `minmax(0, 1fr)` tracks across the available shared content frame, so rendered card width is fluid rather than fixed at `205px`. Below that breakpoint, the grid uses auto-filled `205px` tracks. At `max-width: 680px`, card width is capped by the available width and height becomes `318px`.

The card structure is stable:

1. Domain label and top-right information/favourite controls.
2. Title and clamped description.
3. Fixed media area.
4. Footer divider.
5. Optional Functional marker on the left and Start button on the right.

The card surface is passive. Only the Start button navigates; information and favourite controls have independent state and actions.

## Domain colours

`frontend/src/lib/domainThemes.js` is the frontend source of truth for domain names and visual accents.

| Domain key | Display name | Accent |
| --- | --- | --- |
| `word-finding` | Word Finding | `#0284C7` |
| `reading` | Reading | `#F28C28` |
| `writing` | Writing | `#0EA5A8` |
| `auditory-comprehension` | Listening | `#8B5CF6` |
| `functional-communication` | Functional Tasks | `#D97706` |
| `games` | Games | `#16A34A` |
| `dysphagia` | Dysphagia | `#0F766E` |
| `motor-speech` | Motor Speech | `#F05A3C` |
| `voice` | Voice | `#EF233C` |
| `cognitive-communication` | Cognitive Communication | `#7A853A` |
| `ai-practice` | AI Practice | `#7C3AED` |

Each complete theme also defines dot, soft background, sidebar, icon-tint, blob, and banner values. The fallback theme (`#6366F1`) is a development safety net, not a finished domain treatment.

Known inconsistency: `backend/content.py` still contains older category colours and names. The clinician UI resolves its final theme through `domainThemes.js`; backend category colour values should not be treated as current design tokens.

## Typography

The clinician app loads the Outfit variable font in `frontend/src/index.css`. Root body text, display headings, cards, shell controls, and most clinician components use Outfit with system fallbacks.

Current hierarchy is implemented with a mix of shared CSS and Tailwind utilities rather than one complete type scale:

- Headings use Outfit, usually weight `700` or a nearby variable-font value, with tight line height and slightly negative letter spacing.
- Activity-card domain labels are uppercase `11.3px`, weight `700`, with `0.085em` tracking.
- Activity-card title and description sizing are owned by the `.cat-card-*` rules.
- Voicemail setup body copy uses shared local variables: `0.82rem`, weight `400`, line-height `1.42`, letter-spacing `0`.
- Root body defaults remain `17px` and line-height `1.6`.

Known inconsistencies:

- Tailwind still declares Figtree for `font-sans`, but Figtree is not loaded by the clinician stylesheet.
- The landing page loads Alpino and Satoshi separately.
- Some rules use `var(--font-display)` without a root definition, while others provide an Outfit fallback. The inherited Outfit font generally masks this, but it should be consolidated in a separate approved cleanup.
- Several historical Concentric token names (`--c-*`) remain in `index.css`.

## Controls

There is no single global control-height token across every feature. Current shared patterns include:

- Voicemail setup controls: `--setup-control-height: 2.35rem`, radius `0.68rem`.
- Crossword settings controls: minimum height `2.65rem`, radius `0.65rem`.
- Activity-card Start button: `32px` high, pill radius.
- General shadcn radius token: `--radius: 0.875rem`.

Within a component family, match the local shared token and component owner. Do not copy a height from an unrelated feature merely to create a universal rule.

Use icons from Lucide where available. Keep the full visible control clickable, preserve semantic button/select behaviour, and keep focus treatment confined to the control.

## Spacing, radii, and depth

The implementation uses several established families rather than one universal scale:

- Shell spacing: `12px` viewport inset/padding, `14px` main gap.
- Shared page vertical padding: `1.65rem`; compact pages use `1.5rem`.
- Activity cards: `14px` grid gap, `20px` radius.
- Voicemail setup: sub-rem compact gaps, `0.88rem` selector radius, `1rem` expanded-card radius.
- Shell/top pill use much larger rounded geometry (`30px` and pill radius).

Use a card only for a genuinely framed unit. Avoid cards nested inside cards and avoid heavy shadows. Current clinician surfaces use low-contrast borders, white or warm-white fills, and diffuse shadows.

## Responsive breakpoints

Breakpoints present in `frontend/src/index.css` include `560`, `620`, `640`, `680`, `860`, `900`, `960`, `980`, `1024`, `1101`, `1150`, `1180`, `1280`, and `1500` pixels, plus reduced-motion and print queries. The most important shared clinician thresholds are:

- `961px`: desktop fixed top pill and shell/header treatment.
- `1101px`: five-column fluid activity grid.
- `980px`: voicemail setup stacks to one column.
- `680px`: voicemail controls/actions stack; activity cards fit available width.
- `560px`: compact mobile adjustments.

This is not a clean unified breakpoint system. Reuse the owning component's existing breakpoint unless a deliberate responsive-system cleanup is approved.

## Accessibility expectations

- Use semantic buttons, links, selects, dialogs, and radio groups.
- Provide accessible names for icon-only controls.
- Keep visible keyboard focus. The global fallback is a `2px` indigo outline with `3px` offset.
- Keep explicit controls isolated from passive card surfaces.
- Preserve adequate hit areas even when visible icons are small.
- Support Escape and focus return for transient panels where implemented.
- Respect `prefers-reduced-motion`; favourite and other micro-interactions already include reduced-motion handling.
- Prevent text, media, and controls from overlapping or causing layout shifts.

## Scaling rule

Never use CSS `zoom`, browser zoom, viewport scaling, or a global `transform: scale(...)` to make a page fit. Change actual grid tracks, widths, heights, padding, gaps, media containers, and responsive rules.

## Canonical design guidance

The obsolete root `design_guidelines.json` was removed after a repository-wide audit confirmed that application code, package scripts, build tooling, CI configuration, project instructions, and documentation links did not consume it. It contained superseded Concentric-era branding and design values.

This document is the canonical repository design reference. When implementation and documentation disagree, inspect the live shared owner and update this document as part of the approved change.
