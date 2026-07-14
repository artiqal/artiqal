# Artiqal Agent Instructions

These instructions apply to the whole repository.

## Before editing

- Inspect the current owner, shared component, data source, and nearby patterns before changing anything.
- Preserve unrelated work. The worktree may contain changes from the user or another task; do not revert, reformat, or include them without instruction.
- Preserve current routes, data, copy, and behaviour unless the task explicitly changes them.
- Decide whether the request is shared or page-specific. Reuse shared components for genuinely shared patterns, but do not generalise an experiment or one-page treatment without instruction.

## Implementation

- Fix the root cause. Avoid adding another late CSS override when an existing owner, token, selector, or layout rule can be corrected safely.
- Follow existing repository patterns before adding abstractions. Add a shared abstraction only when multiple real consumers need it.
- Never solve layout with CSS `zoom`, browser zoom, viewport scaling, or a global `transform: scale(...)` on `html`, `body`, `#root`, or the app shell.
- Keep accessibility intact: semantic controls, keyboard use, focus visibility, accessible names, reduced-motion support, and non-overlapping hit areas.
- Do not commit or push unless the user explicitly approves it.

## Bugs and verification

- For bugs: reproduce first, identify the cause, add a focused regression test where practical, then fix.
- For shared UI changes: verify representative library, category, search, and favourites views as applicable, plus expanded and collapsed sidebar states.
- For routing or state changes: verify refresh, Back, direct URL entry, duplicate prevention, missing-state fallbacks, and the relevant persistence behaviour.
- Run relevant tests and the production build before reporting completion. If a check cannot run, say why.
- Report the behaviour verified and list every file changed.
