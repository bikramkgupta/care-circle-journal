# Stage 2: Local Coding

**Status**: COMPLETE
**Prerequisites**: Stage 1 complete

---

## Overview

Implement the application following the design from Stage 1. Initialize monorepo and implement services.

---

## Tasks

### 2.1 Project Setup (Monorepo)
- [x] Initialize `pnpm` workspace
- [x] Setup `apps/frontend` (Next.js, Tailwind)
- [x] Setup `apps/api` (Express, Prisma)
- [x] Setup `apps/worker` (Node.js cron)
- [x] Setup `packages/shared` (Types, Zod schemas)
- [x] Configure `tsconfig.json` at root

### 2.2 Backend Implementation (`apps/api`)
- [x] Setup Prisma connection to local Postgres
- [x] Implement Auth (Signup, Login, JWT)
- [x] Implement Auth `/me` endpoint
- [x] Implement Care Profile CRUD
- [x] Implement Entries CRUD
- [x] Implement Media presigned URLs (Spaces)
- [x] Implement real Gradient AI client (OpenAI-compatible)
- [x] Implement Summaries routes

### 2.3 Frontend Implementation (`apps/frontend`)
- [x] Setup landing page
- [x] Setup Auth pages (Login, Signup)
- [x] Setup Dashboard / Care Profile list
- [x] Implement Timeline view (with entry creation)
- [x] Implement Insights view (with charts - recharts)
- [x] Implement Moments (Media) view
- [x] Implement Demo page

### 2.4 Worker Implementation (`apps/worker`)
- [x] Setup scheduled jobs (Daily summary trigger)
- [x] Add health check HTTP endpoint
- [x] Graceful shutdown handling

### 2.5 Dockerfiles & Health Checks
- [x] Create `Dockerfile` for `apps/api`
- [x] Create `Dockerfile` for `apps/frontend`
- [x] Create `Dockerfile` for `apps/worker`
- [x] API exposes `GET /health` returning 200 OK
- [x] Frontend exposes `GET /health` returning 200 OK
- [x] Worker exposes health check endpoint on PORT

### 2.6 App Spec (`.do/app.yaml`)
- [x] Create `.do/app.yaml` with:
    - `services`: api, frontend
    - `workers`: worker
    - `databases`: Postgres (managed)
    - `envs`: DATABASE_URL, SPACES_*, GRADIENT_*, JWT_SECRET
- [x] Set `deploy_on_push: false` for all components
- [x] Validate spec: `doctl apps spec validate .do/app.yaml`

### 2.7 CI/CD Workflow
- [x] Create `.github/workflows/deploy.yml`

---

## Verification

| Check | Expected | Status |
|-------|----------|--------|
| `pnpm build` | All apps build | [x] |
| Dockerfiles created | api, frontend, worker | [x] |
| `.do/app.yaml` validated | `doctl apps spec validate` passes | [x] |

---

## Artifacts Created

- `apps/api/Dockerfile`
- `apps/frontend/Dockerfile`
- `apps/worker/Dockerfile`
- `apps/frontend/next.config.js` (standalone output)
- `.do/app.yaml`
- `.github/workflows/deploy.yml`
