# Contributing to Artiqal

Artiqal is under active development. Keep changes focused, clinically appropriate, and easy to review.

## Branches and commits

- Use a short task branch for feature or repair work when the maintainer has not asked for work directly on `main`.
- Keep commits focused on one coherent change. Do not mix generated files, preview logs, screenshots, or unrelated cleanup into a product commit.
- During Codex tasks, do not commit or push until the user explicitly approves both the scope and the action.
- Before staging, inspect the worktree and separate pre-existing work from files changed for the task.
- Write commit messages that describe the user-visible or architectural result.

## Local setup

The full setup and environment variables are in the [README](README.md). The commands below are backed by scripts and dependencies in this repository.

### Frontend

From `frontend/`:

```bash
npm install
npm start
npm test -- --watchAll=false --passWithNoTests
npm run build
```

`npm start`, `npm test`, and `npm run build` are defined in `frontend/package.json`. Frontend automated coverage is currently limited, so browser verification is required for UI changes.

### Backend

From the repository root, after installing `backend/requirements.txt` into an active Python environment:

```bash
python -m pytest backend/tests
```

The backend requirements also include Black, isort, Flake8, and mypy. Run a formatter or broad static check only when its scope is understood; do not create unrelated formatting churn.

## Assets

- Put application artwork in `frontend/src/assets/`; files imported by React should stay there.
- Put files that must be addressed directly by URL in `frontend/public/`.
- Prefer descriptive lowercase kebab-case names, for example `activity-card-voicemail.png` or `domain-reading.png`.
- Preserve the source aspect ratio. Use a fixed media container and `object-fit` in the component rather than editing layout around one asset.
- Update the existing central mapping in `frontend/src/lib/activityIllustrations.js` or the owning config instead of hardcoding a path in one page.
- Before deleting a replaced asset, confirm it has no imports or public URL references.
- The repository contains older `.jpeg` names and duplicate font formats. Treat those as legacy, not as examples to copy.

## Shared components and data

- `HubShell`, `HubTopbar`, and `HubSidebar` own the shared clinician frame.
- `ActivityCard` owns the shared library card. Activity navigation remains Start-button-only.
- `activities-card-grid` in `frontend/src/index.css` is the canonical activity-card grid owner.
- Domain styling belongs in `frontend/src/lib/domainThemes.js`.
- Backend activity records belong in `backend/content.py`; frontend display and search supplements belong in the relevant `frontend/src/lib/` owner.
- Do not duplicate an activity to make it appear in another category. Use primary-category and functional metadata as documented in [Activity Architecture](docs/activity-architecture.md).
- Prefer a root-cause change in the owner over page-specific CSS appended later in `index.css`.

## Review checklist

- [ ] The change matches the requested shared or page-specific scope.
- [ ] Existing routes, data, search, favourites, and session behaviour are preserved unless intentionally changed.
- [ ] Interactive controls remain semantic, keyboard accessible, and visibly focusable.
- [ ] Long text, empty states, and smaller viewports remain usable.
- [ ] Shared UI was checked on representative pages and with both sidebar states.
- [ ] Routing/state changes were checked on refresh, Back, direct URL entry, duplicate prevention, and fallback paths.
- [ ] Relevant tests passed.
- [ ] The frontend production build passed.
- [ ] No preview logs, screenshots, build output, or unrelated files are included.
- [ ] Documentation was updated when an architecture, workflow, or shared rule changed.

## Reporting work

Completion notes should state:

1. What changed and where.
2. What was verified, including commands and browser flows.
3. Any check that could not run or any remaining risk.
4. The complete list of files changed for the task.

## Documentation ownership

- `README.md`: repository orientation, verified product status, setup, and links.
- `CONTRIBUTING.md`: contributor workflow and review expectations.
- `AGENTS.md`: permanent instructions for coding agents.
- `docs/design-system.md`: implemented visual system, shared layout owners, and known inconsistencies.
- `docs/activity-architecture.md`: activity data, cards, search, favourites, setup, runtime, and session identity.
- Product strategy and roadmap decisions should live in the team's product workspace. Approved clinical copy and clinical review records should live in the team's clinical documentation workspace. When either changes code-facing behaviour or data, update the relevant repository documentation in the same task.
- `memory/PRD.md`, `auth_testing.md`, and test reports contain historical Concentric-era material. They are not current architecture or design sources of truth.
