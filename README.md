# Agri Workforce Scheduler — Frontend

Vite + React 19 + TypeScript + Tailwind CSS SPA for loading scenarios, viewing hybrid LLM + OR-Tools assignments, recomputing schedules, and force-assigning tasks.

## Prerequisites

- Node.js 20+ recommended
- Sibling FastAPI app `agri-workforce-scheduler-backend` (or your deployment) exposing the API below, with DB configured

## Setup

```bash
npm install
cp .env.example .env
# Set VITE_API_URL to your API origin (e.g. http://localhost:8000)
npm run dev
```

The OpenAPI-generated client lives in [`src/api/generated/`](src/api/generated/). Base URL is set from `VITE_API_URL` in [`src/api/openapi.ts`](src/api/openapi.ts) (called from [`src/main.tsx`](src/main.tsx)).

## API (backend)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness |
| GET | `/scenarios/{sid}` | Scenario definition (`sid` must be `1` or `2`): agronomists and tasks |
| GET | `/scenarios/{sid}/assignments` | Cached hybrid decision; query `refresh=true` to recompute with LLM + solver |
| POST | `/scenarios/{sid}/force-assign` | Body `{ task_id, agronomist_id }` — pin assignment and re-optimize (requires a saved decision; call assignments first) |

Types are generated from OpenAPI into `src/api/generated/types.gen.ts` (`ScenarioInfo`, `AssignmentsResult`, `HybridStep`, `Assignment`, `ForceAssignRequest`, etc.).

## OpenAPI code generation

When your backend publishes OpenAPI JSON (for example at `http://localhost:8000/openapi.json`):

```bash
export VITE_OPENAPI_URL=http://localhost:8000/openapi.json
npm run generate-api
```

For production spec URL:

```bash
export VITE_OPENAPI_URL_PROD=https://api.example.com/openapi.json
npm run generate-api:prod
```

If export names change, update [`src/api/hooks.ts`](src/api/hooks.ts) to match `sdk.gen.ts`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run format` | Prettier |
| `npm run generate-api` | Regenerate `src/api/generated` from OpenAPI |

## Roadmap / TODO

- **Manager approval workflow:** pending task queue, approve / override actions — once the backend exposes endpoints (for example `GET /tasks/pending`, `POST /tasks/approve`).
- **Audit log UI:** chronological decision history — once the backend exposes an audit or events API.
- **OpenAPI accuracy:** type `POST /scenarios/{sid}/force-assign` as returning `Decision` (or equivalent) in the spec so the generated client is not `unknown`.

## Documentation

See [SETUP.md](./SETUP.md) for a concise checklist.
