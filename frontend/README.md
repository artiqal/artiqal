# Artiqal Frontend

The Artiqal frontend is the React clinician interface for browsing activities, configuring therapy tasks, building sessions, and running supported activities. It uses Create React App through CRACO, React Router, shared clinician-shell components, and central activity presentation helpers.

For repository-wide setup and architecture, start with the [root README](../README.md).

## Project guidance

- [Contributor workflow](../CONTRIBUTING.md)
- [Permanent Codex instructions](../AGENTS.md)
- [Verified design system](../docs/design-system.md)
- [Activity architecture](../docs/activity-architecture.md)

The root documentation is authoritative for shared clinician UI, activity cards, activity data, setup configuration, runtime state, search, favourites, and Build Session behaviour. Do not create frontend-only alternatives to those shared patterns without an explicitly approved architecture change.

## Local development

From `frontend/`:

```bash
npm install
npm start
```

The development server opens at `http://localhost:3000` by default. Configure the API URL in `frontend/.env.local`:

```dotenv
REACT_APP_BACKEND_URL=http://localhost:8000
```

## Verification

Run the frontend test runner once:

```bash
npm test -- --watchAll=false --passWithNoTests
```

Create the production build:

```bash
npm run build
```

Automated frontend coverage is currently limited. For UI work, also perform the browser checks required by [CONTRIBUTING.md](../CONTRIBUTING.md).

## Directory structure

```text
frontend/
|-- public/                 # Static public files and the HTML entry document
|-- src/
|   |-- assets/             # App, domain, and activity artwork
|   |-- components/         # Shared shell, activity cards, navigation, and UI primitives
|   |-- contexts/           # Authentication and Build Session state
|   |-- hooks/              # Reusable React hooks
|   |-- lib/                # Themes, activity metadata, search, favourites, and navigation helpers
|   |-- pages/              # Route-level clinician and public screens
|   |-- App.js              # Route definitions and shared-shell selection
|   |-- index.js            # React application entry point
|   `-- index.css           # Shared visual and layout styles
|-- craco.config.js         # Create React App overrides
|-- package.json            # Frontend dependencies and verified scripts
`-- tailwind.config.js      # Tailwind configuration
```

Keep route-level composition in `pages/`, reusable UI in `components/`, shared state in `contexts/`, and central activity/theme/search helpers in `lib/`. Inspect the existing owner before introducing another source of truth.
