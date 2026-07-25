# Artiqal

Artiqal is an adult speech and language therapy clinician web application. It brings therapy activities, configurable practice, search, favourites, and session workflows into one clinical workspace.

The product is under active development. This repository contains a React clinician interface and a FastAPI backend with MongoDB-backed authentication and saved session records.

## Documentation

- [Contributing](CONTRIBUTING.md)
- [Permanent agent instructions](AGENTS.md)
- [Implemented design system](docs/design-system.md)
- [Activity architecture](docs/activity-architecture.md)

## Current Product Status

### Implemented

- Clinician app shell with shared sidebar, top navigation, content frame, and responsive layouts.
- Activities Library with domain browsing, search, sorting, filtering, and shared activity cards.
- Domain/category views and shared activity routes.
- Configurable setup and direct runtime flow for Listening to a Voicemail.
- Runtime implementations for selected activities; other activity types still include placeholders or partial flows.
- Reading, Listening, Word Finding, Games, and Functional Task activity content.
- Shared domain theme system and reusable activity illustration mappings, with remaining ownership splits documented.
- Activity information panels; the currently displayed clinical fields and configured keywords feed shared search.
- Browser-persisted favourites shared across library, category, search, and favourite views.
- Authentication, clinician session records, text-to-speech, transcription, and scenario-generation API endpoints.

### In progress or planned

- Additional activities across the existing therapy domains.
- Full activity collections for domains that currently have navigation or empty states only.
- Expanded AI Practice workflows and production hardening. Current AI Practice navigation does not imply a complete activity collection.
- Broader automated frontend coverage and deployment documentation.

## Tech Stack

### Frontend

- React 19
- React Router 7
- Create React App with CRACO
- Tailwind CSS plus shared application CSS
- Radix UI primitives
- Lucide icons
- Axios

### Backend

- Python and FastAPI
- Uvicorn
- MongoDB via Motor
- Pydantic
- JWT and bcrypt authentication
- Pytest, Black, isort, Flake8, and mypy

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3 with `venv`
- A MongoDB instance

### 1. Clone the repository

```bash
git clone <repository-url>
cd artiqal
```

### 2. Configure the backend

Create `backend/.env`. The backend currently reads these variables:

```dotenv
MONGO_URL=mongodb://localhost:27017
DB_NAME=artiqal
JWT_SECRET=replace-with-a-secure-secret
FRONTEND_URL=http://localhost:3000

# Optional external AI integrations
EMERGENT_LLM_KEY=
ENABLE_EXTERNAL_AI_SESSION_NOTES=false

# Optional one-time administrator bootstrap; omit both unless needed
# ADMIN_EMAIL=owner@example.com
# ADMIN_PASSWORD=choose-a-unique-password
```

Administrator bootstrap is disabled unless both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are
set to non-empty values. Startup creates the configured administrator only when that
email does not already exist; it never changes an existing password.

Saving a session produces a deterministic local objective summary by default. External
AI generation for that summary requires both `ENABLE_EXTERNAL_AI_SESSION_NOTES=true`
and `EMERGENT_LLM_KEY`. The TTS, transcription, and scenario-generation endpoints are
separate explicit integrations and may still contact the configured provider when a
user invokes those controls.

Then install and run the API:

```bash
cd backend
python -m venv .venv
```

Activate the environment:

```bash
# macOS/Linux
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1
```

```bash
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

The API is available at `http://localhost:8000/api`.

### 3. Configure the frontend

Create `frontend/.env.local`:

```dotenv
REACT_APP_BACKEND_URL=http://localhost:8000
```

The public contact form posts to the backend at `/api/contact`. Configure delivery
in `backend/.env`; these values are never exposed to the frontend:

```dotenv
RESEND_API_KEY=re_replace_with_a_sending_key
CONTACT_FROM_EMAIL=Artiqal <contact@example.com>
CONTACT_TO_EMAIL=contact@example.com
CONTACT_SUBJECT_PREFIX=[Artiqal Website]
CONTACT_RATE_LIMIT_MAX_REQUESTS=5
CONTACT_RATE_LIMIT_WINDOW_SECONDS=900

# Password reset delivery (uses the same Resend account)
PASSWORD_RESET_URL=http://localhost:3000/reset-password
PASSWORD_RESET_FROM_EMAIL=Artiqal <contact@example.com>
PASSWORD_RESET_SUPPORT_EMAIL=support@example.com
PASSWORD_RESET_TOKEN_TTL_SECONDS=3600
PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS=5
PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS=900
```

All four values are required, and the sender must use a domain verified in Resend.
The form sends through Resend's single-email API and supports up to five optional,
validated PDF, PNG, JPG, DOC, or DOCX attachments. Each file may be up to 10 MB,
with a 25 MB combined limit. When delivery is not configured
or Resend does not confirm the request, the API reports an error and does not present
the message as sent.

The Contact endpoint applies a per-IP sliding-window limit. The default is five valid,
successfully delivered submissions per 900 seconds; the two rate-limit variables above
may be adjusted per deployment. Invalid requests and delivery failures do not consume
capacity. Production deployments behind a reverse proxy must configure the application
server and proxy to supply a trustworthy client address. Artiqal does not trust arbitrary
`X-Forwarded-For` values in application code.

Password reset requests always return the same accepted response for known, unknown,
and Google-only accounts. Eligible email/password accounts receive a single-use link;
only a SHA-256 hash of the token is stored, and MongoDB's TTL index removes expired
token records. Resetting a password invalidates existing JWTs and stored login sessions.
The password-reset limiter uses the direct client address and safe defaults of five
requests per 900 seconds. It is process-local, so a production deployment with multiple
workers should replace it with a shared rate-limit store. If Artiqal is deployed behind
a reverse proxy, configure that trusted proxy and the application server to provide the
real client address; the application deliberately does not trust arbitrary
`X-Forwarded-For` headers.

Install and run the frontend:

```bash
cd frontend
npm install
npm start
```

The development app opens at `http://localhost:3000` by default.

## Project Structure

```text
artiqal/
|-- backend/
|   |-- content.py          # Categories, activities, levels, and activity content
|   |-- server.py           # FastAPI app, auth, activity, AI, and session endpoints
|   |-- requirements.txt
|   `-- tests/
|-- frontend/
|   |-- public/
|   `-- src/
|       |-- assets/         # App, domain, and activity artwork
|       |-- components/     # Shared shell, cards, navigation, and UI primitives
|       |-- contexts/       # Authentication and session state
|       |-- lib/            # Themes, metadata, search, favourites, sorting, navigation
|       |-- pages/          # Route-level screens
|       |-- App.js          # Routes and shared-shell selection
|       `-- index.css       # Shared visual and layout system
|-- docs/                   # Implemented design and activity architecture
|-- tests/                  # Repository-level test material
|-- AGENTS.md               # Permanent coding-agent rules
|-- CONTRIBUTING.md         # Contributor workflow
`-- README.md
```

## Core Architecture

### Routing and shell

`frontend/src/App.js` defines public and protected routes. Clinician routes are rendered inside `HubShell`, which owns the shared sidebar, top navigation, content boundaries, and shell behaviour.

Important clinician routes include:

- `/all-activities`
- `/category/:slug`
- `/activity/:category/:slug`
- `/sessions` and `/sessions/:sessionId`
- `/search`
- `/sfa`

### Shared activity presentation

`ActivityCard.jsx` is the reusable library card used across activity collections. Activity navigation is intentionally Start-button-only; the card surface, information control, and favourite control have separate responsibilities.

The supporting configuration is split by concern:

- `activityCardConfig.js`: display metadata, functional flags, information-panel fields, and searchable clinical text.
- `activityIllustrations.js`: activity and page illustration mappings.
- `domainThemes.js`: domain names, routes, colours, gradients, and navigation entries.
- `activityIndex.js`: normalized shared search indexing and matching.
- `activityFavourites.js`: local-storage favourite keys and cross-view update events.
- `navigationHistory.js`: safe in-app return navigation.

### Backend content and API

`backend/content.py` is the base source for categories, activities, exercise content, and questions. Frontend display, theme, search, favourite, setup, and session concerns have separate owners under `frontend/src/lib/` and `frontend/src/contexts/`. See [Activity Architecture](docs/activity-architecture.md) before adding or moving activity data.

## Activity Data Model

An activity is identified by its category and stable `slug`. Typical fields include:

```python
{
    "slug": "voicemails",
    "title": "Listening to a Voicemail",
    "summary": "...",
    "primary_category": "auditory-comprehension",
    "is_functional": True,
    "tags": ["listening", "functional", "voicemail"],
    "content": {
        "levels": {
            "green": {"title": "Foundational", "letters": []},
            "amber": {"title": "Intermediate", "letters": []},
            "red": {"title": "Complex", "letters": []},
            "pink": {"title": "Extended", "letters": []},
        }
    },
}
```

This is an illustrative shape, not a schema enforced across every activity type. The current voicemail internal difficulty key remains `pink`, while its visible title is Extended.

Frontend metadata may supplement an illustration, functional marker, information-panel copy, and clinician-facing search terms. Keep displayed information and searchable information in the same owning configuration so they cannot drift apart.

Functional status is secondary metadata, not necessarily the primary visual domain. For example, a Reading activity can remain Reading-themed while also appearing in Functional Tasks through `is_functional`.

## Adding activities and domains

Use the step-by-step checklist in [Activity Architecture](docs/activity-architecture.md). Do not create separate copies of one activity for different filters or pages. For a new domain, add complete `DOMAIN_THEMES` and `DOMAIN_NAV_ITEMS` entries before treating the fallback theme as finished UI.

## Design and implementation guardrails

The verified shared values, breakpoints, accessibility expectations, and known inconsistencies are documented in [Design System](docs/design-system.md). Permanent coding-agent rules live in [AGENTS.md](AGENTS.md).

## Naming Conventions

- React components and files: `PascalCase.jsx`
- Utilities and configuration: `camelCase.js`
- Route and category slugs: lowercase kebab-case
- Python functions and fields: snake_case
- Asset names: descriptive lowercase kebab-case where practical
- Activity titles: clinician-facing title case
- Domain labels: derive from shared domain configuration rather than hardcoding variants

When replacing an asset, update the existing central mapping and remove an obsolete asset only after confirming it has no other references.

## Testing and Quality Checks

### Frontend

```bash
cd frontend
npm test -- --watchAll=false --passWithNoTests
npm run build
```

`npm test` runs the CRA test runner. Frontend automated coverage is currently limited, so visually verify shared views and responsive states for UI changes.

### Backend

```bash
python -m pytest backend/tests
```

The local administrator and session-note safety checks are deterministic and do not
require MongoDB or an external provider:

```bash
python -m unittest backend/tests/test_backend_safety.py
```

The older live API integration suites are skipped unless `BACKEND_TEST_URL`,
`ADMIN_EMAIL`, and `ADMIN_PASSWORD` are explicitly supplied. Their direct TTS,
transcription, and scenario-generation checks additionally require
`RUN_EXTERNAL_AI_TESTS=true`.

Optional static checks supported by the installed backend toolchain:

```bash
black --check .
isort --check-only .
flake8 .
mypy .
```

For activity or shared-card changes, verify:

- Activities Library, category, search, and favourites render the same activity consistently.
- Search, sorting, domain filtering, information panels, favourites, and Start routes still work.
- Long titles and descriptions do not clip or overlap media and footer regions.
- Expanded and collapsed sidebar states have no horizontal overflow.
- Browser console and API logs contain no new errors.

## Product and clinical documentation

This README is the technical front page. Keep product strategy and approved clinical copy/review records in their dedicated team workspaces. When those decisions change repository behaviour, data, setup, or contributor workflow, update the relevant repository documentation in the same task.

`memory/PRD.md`, `auth_testing.md`, and test reports contain Concentric-era material. They are historical references, not current Artiqal design or architecture sources of truth.

## Roadmap

- Continue expanding clinically reviewed activities and level content.
- Add activities to currently empty or exploratory domains.
- Strengthen automated frontend and integration test coverage.
- Formalize deployment, environment, and production operations guidance.
- Mature AI-assisted practice behind clear clinical and privacy guardrails.

---

Artiqal is actively evolving. Keep changes centralized, reusable, clinically intentional, and easy for the next contributor to understand.
