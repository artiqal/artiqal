# Activity Architecture

This document describes the current activity architecture as implemented. It also records the places where legacy fallback logic or duplicated metadata can drift.

## Data ownership

### Backend activity content

`backend/content.py` owns:

- `CATEGORIES`: API category records.
- `ACTIVITIES_BY_CATEGORY`: activity records and their exercise content.
- `ACTIVITY_CARD_METADATA`: a backend supplement merged into matching activity records at import time.
- `SFA_WORDS`: Semantic Feature Analysis targets.
- `get_activity(category_slug, activity_slug)`: exact category/slug lookup.

`backend/server.py` exposes the content through:

- `GET /api/categories`
- `GET /api/activities`
- `GET /api/categories/{slug}/activities`
- `GET /api/activities/{category}/{activity_slug}`
- `GET /api/sfa/words`

The all-activities endpoint adds the owning `ACTIVITIES_BY_CATEGORY` key as `category`. The category endpoint also includes activities whose `primary_category` matches the requested category and functional activities when the requested category is `functional-communication`; it deduplicates by slug.

### Frontend supplements

Frontend concerns are split across:

- `frontend/src/lib/domainThemes.js`: domain display names, routes, icons, accents, gradients, and navigation entries.
- `frontend/src/lib/activityCardConfig.js`: card metadata fallbacks, information-panel fields, and information-derived search text.
- `frontend/src/lib/activityIllustrations.js`: imported illustration exports; `ActivityCard.jsx` also imports several card assets directly.
- `frontend/src/lib/activityIndex.js`: category membership, primary-category fallback rules, retired slugs, href construction, normalisation, indexing, and scoring.
- `frontend/src/lib/activityFavourites.js`: browser favourite identity and update events.
- `frontend/src/lib/activitySetupConfig.js`: voicemail setup options and filtering.
- `frontend/src/lib/navigationHistory.js`: safe in-app Back behaviour.
- `frontend/src/contexts/SessionContext.jsx`: active Build Session state and configured-item identity.

The backend activity object is the base record. Do not create a second page-specific activity dataset.

## Identity, slugs, and routes

The practical activity identity is the owning backend `category` plus stable activity `slug`:

```text
/activity/:category/:slug
```

`getActivityHref(activity)` in `activityIndex.js` builds this route, except `sfa-tool`, which routes to `/sfa`.

Use lowercase kebab-case slugs and keep them stable. Changing a slug changes routes, saved references, search/card keys, and potentially session identity.

### Primary and secondary category membership

Relevant backend fields are:

- `primary_category`: the activity's visual/primary domain when different from its storage category.
- `is_functional`: secondary Functional Tasks membership.
- `tags`: activity search and clinical terms.

For example, appointment and medication-label tasks are stored under `functional-communication`, but use `primary_category: "reading"` and `is_functional: True`. They remain one record, render with the Reading theme, and can appear in both Reading and Functional Tasks.

`activityIndex.js` accepts camelCase and snake_case variants and still contains slug-specific fallbacks for `sfa-tool`, `appointment-letter`, `prescription-medication-labels`, and `voicemails`. Those fallbacks protect older records but are duplication risks. Prefer correct backend fields for new activities.

## Shared activity card

`frontend/src/components/ActivityCard.jsx` owns the rendered library card across Activities Library, category views, search, and favourites.

It derives:

- display category via `getActivityDisplayCategory`;
- domain theme via `getDomainTheme`;
- functional status via `isFunctionalActivity`;
- card visual and information via `activityCardConfig.js`;
- destination via `getActivityHref`;
- source route state via `getLocationSnapshot`.

The card container is non-interactive. The Start button alone navigates. Information and favourite buttons stop propagation and own their own accessible state.

Current visual mappings are not fully centralised: `activityIllustrations.js` exports shared page/card assets, while `ActivityCard.jsx` directly imports several specific card illustrations. When replacing an existing visual, update the current owner rather than adding a second mapping.

## Information panel fields

`getActivityCardInfo()` reads metadata from the activity record and `activityCardConfig.js`. Supported canonical output fields are:

- `clinicalTargets`
- `skillsAddressed`
- `taskFormat`
- `difficulty`
- `usefulFor`
- `suggestedLevel`
- `itemCount`
- `clinicianTips`

It accepts common camelCase and snake_case source variants. Empty values are removed. At present, `ActivityCard.jsx` visibly renders only:

1. Clinical Targets
2. Difficulty
3. Useful For

The other normalised fields are supported by the data helper but are not currently rendered by the card panel. Do not document them as visible until the component renders them.

## Search indexing

All shared search behaviour is owned by `frontend/src/lib/activityIndex.js`:

1. `buildActivityIndex()` combines title, category, tags, details, and informational search text.
2. `normalizeSearchQuery()` lowercases and normalises punctuation, hyphens, slashes, and repeated whitespace.
3. `searchActivityIndex()` requires every query term to match and sorts by field-weighted score.
4. Single-character terms only match title/category word starts.

`getActivityCardSearchTextValues()` in `activityCardConfig.js` adds displayed clinical targets, difficulty, useful-for text, explicit search keywords, and plain-text future metadata unless a structured value has `searchable: false`.

Do not build a separate search dataset for a page. Update the central activity or information metadata so display and search stay aligned.

## Favourites

`frontend/src/lib/activityFavourites.js` stores favourite keys in browser local storage:

```text
artiqal:favourite-activities
```

`getActivityFavouriteKey(activity)` currently prefers:

1. `activity.slug`
2. `activity.id`
3. `activity.title`

Updates dispatch `artiqal:favourites-updated` so visible shared cards can synchronise in the same tab; the browser `storage` event covers other tabs.

Known risk: slug-only identity can collide if two categories legitimately use the same slug. New activities should use globally unique slugs under the current implementation, or favourite identity should be migrated deliberately in a separate task.

## Voicemail setup configuration

`ACTIVITY_SETUP_CONFIGS.voicemails` in `frontend/src/lib/activitySetupConfig.js` owns the setup defaults, option arrays, and voicemail level display overrides. Pure setup rules are separated by responsibility:

- `frontend/src/lib/voicemailSetup.js` creates defaults, normalizes and validates setup values, applies level display overrides, builds the configured session payload, and serializes setup values into runtime search parameters.
- `frontend/src/lib/voicemailSelection.js` filters voicemail items by pack and language, removes duplicate stable IDs, clamps requested item counts to availability, and clamps each item's question selection.

Current state fields are:

```js
{
  difficultyId,
  themePackId,
  languageId,
  itemCount,
  questionsPerVoicemail,
}
```

Current verified options/defaults:

- Difficulty default: `green`.
- Theme pack: available `mixed-bag`; unavailable future definitions remain in config but are filtered from the UI.
- Language: available `en` displayed as English (UK/US); future language definitions are filtered out.
- Item counts: `[2, 4, 6, 8, 10]`, default `4`.
- Questions per voicemail: `[1, 2, 3, 4, 5]`, default `3`.

The difficulty keys remain `green`, `amber`, `red`, and `pink`. The `pink` display title is **Extended**, not Bonus. Keep the internal key for compatibility unless a migration is explicitly approved.

`getValidSetupItemCount()` validates configured item-count options. `normalizeVoicemailSetupSelection()` safely restores stale setup values to configured defaults. `getAvailableVoicemailItems()` currently supports only `mixed-bag` and filters each level's `letters` by `languageId` (defaulting missing item language to `en`).

## Voicemail runtime state and direct URLs

`LeveledReadingExercise` in `frontend/src/pages/ActivityPage.jsx` orchestrates the page and uses URL search parameters as runtime configuration. It imports voicemail setup and selection rules from the focused modules above rather than owning those rules directly:

- `level`
- `pack`
- `language`
- `count`
- `questions`
- `letter`
- `done=1`

Start writes the validated setup values and first item ID into the URL, entering runtime directly. Runtime:

- filters items by level, pack, and language;
- clamps requested item count to available items;
- takes the first configured items in source order;
- slices each item's existing questions to `questionsPerVoicemail`;
- advances by stable item IDs;
- uses the completion view after the final configured item.

If the voicemail URL has a level but no item, the current effect restores setup state and replaces the URL with the setup route. Back from voicemail runtime also restores the available URL configuration into local setup state before clearing search parameters.

Important limitation: setup selection itself is component-local state. A full refresh on a valid runtime URL can reconstruct runtime from the URL, but returning to setup after a full remount falls back to setup defaults unless values are restored during that mounted flow. There is no separate persisted setup object.

Non-voicemail leveled reading activities still use the legacy level/item picker flow. Do not remove that shared infrastructure when changing voicemail routing.

## Build Session identity

`frontend/src/contexts/SessionContext.jsx` stores the active client-side session under legacy key:

```text
concentric_active_session_v1
```

Configured activity identity is built by `getSessionActivityKey()` in `frontend/src/lib/sessionActivityIdentity.js` from:

- `category`
- `activity_slug`
- `setup_config.difficultyId`
- `setup_config.themePackId`
- `setup_config.languageId`
- `setup_config.itemCount`
- `setup_config.questionsPerVoicemail`

`logActivity()` prevents duplicate keys. `removeActivity()` removes the exact configured key. Changing configuration therefore produces a different pending session item rather than silently mutating a saved configuration.

The active session, attempts, and cues persist in local storage. Completed session records are saved to backend `/api/sessions` endpoints. The setup-page add/remove toggle reflects the current active-session array.

Known legacy behaviour: `ActivityPage` also logs non-reading-leveled activities on page load, and runtime item attempts can log level/item-specific activity slugs. Session summaries therefore use a different identity granularity from setup-plan items in some flows.

## Safe Back behaviour

`frontend/src/lib/navigationHistory.js` allows only known in-app path prefixes. `useSmartBack()` uses:

1. a valid `location.state.from` source,
2. browser/router history when an in-app history index exists,
3. `/all-activities` as the final fallback.

`ActivityCard` passes the current pathname, search, and hash as `from` when Start is clicked. Any new activity entry point should preserve that pattern.

## Adding an activity safely

1. Add one record to the correct list in `ACTIVITIES_BY_CATEGORY` in `backend/content.py`.
2. Use a stable, globally unique lowercase kebab-case `slug`, clinician-facing `title`, concise `summary`, `type`, and the content structure expected by the renderer.
3. Set `primary_category` when the visual domain differs from the storage category.
4. Set `is_functional: True` for secondary Functional Tasks membership; do not duplicate the activity record.
5. Add meaningful `tags`, clinical metadata, and search terms to the central record or `activityCardConfig.js` owner.
6. Add a complete domain theme only if introducing a new domain.
7. Place the asset in `frontend/src/assets/` and update the existing illustration/card-visual owner.
8. Add setup config only if the activity has a real configurable setup flow. Keep setup and runtime state separate.
9. Confirm the detail route resolves using the owning backend category, even if `primary_category` changes visual/filter membership.
10. Verify library, primary category, Functional Tasks when applicable, search, favourites, information panel, Start-only navigation, direct URL, refresh, Back, and session duplicate prevention.

### Free-tier activity guardrails

- Give each new active runtime a clear owner under `frontend/src/components/activities/`; keep `ActivityPage.jsx` focused on route loading, normalization, shared shell, and dispatch.
- Keep activity-specific styles beside their owner. Add rules to `frontend/src/index.css` only when they are genuinely global or shared across established consumers.
- Keep activity-specific clinical and content rules in one owner or data source rather than duplicating them across frontend components.
- Reuse existing activity, session, navigation, and answer-rendering infrastructure where it matches the required behaviour; do not create a parallel framework for a single activity.
- Extend the current metadata owner instead of introducing another hard-coded activity map. Where legacy backend/frontend duplication remains, do not add a third source.
- Add focused behavioural coverage for every new activity, including its route dispatch, core interaction, progression or completion, and session logging where applicable.
- Treat the current Supabase Green voicemail slice as a pilot. Do not generalise it into a final cross-activity schema until additional activity requirements justify that design.

## Known legacy exceptions and drift risks

- Historical `Concentric` identifiers remain only where renaming would risk compatibility (session IDs and the local-storage session key), in legacy asset-host URLs, test filenames, and clearly marked historical documents.
- Backend category colours are older than `domainThemes.js`.
- Frontend `activityCardConfig.js` duplicates some backend `ACTIVITY_CARD_METADATA` entries.
- `activityIndex.js` contains slug-specific category and functional fallbacks.
- Favourite identity is slug-only when a slug exists.
- Activity visuals are split between `activityIllustrations.js` and direct imports in `ActivityCard.jsx`.
- Voicemail defaults, option definitions, level labels, and display copy are owned by `frontend/src/lib/activitySetupConfig.js`; `ActivityPage.jsx` consumes that configuration for rendering and orchestration.
- The voicemail `pink` title is Extended in active frontend/backend content, while historical docs still say Bonus.
- Unavailable setup packs/languages remain in configuration and are filtered by `available`; only Mixed Bag and English are exposed.
- `ActivityPage.jsx` and `frontend/src/index.css` are large multi-feature owners with legacy sections and duplicate override risk.

Do not fix these incidentally. Each migration needs an approved scope, compatibility plan, and regression verification.
