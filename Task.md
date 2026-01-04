Project Spec: CareCircle Journal

An AI-assisted shared journal for families and caregivers, built and deployed on DigitalOcean App Platform. This document defines the architecture, data model, APIs, frontend flows, and testing plan so an AI agent (Gemini) can implement it step by step.

1. Goal and Scope

Build a production-ready web app where multiple caregivers can log daily observations, events, and media for one or more “Care Profiles” (e.g., a child, nonverbal adult, elderly parent), and use AI to generate:
	•	Daily summaries (“what happened today?”)
	•	Weekly/monthly pattern insights
	•	A “doctor view” report

Non-goals for v1:
	•	Clinical decision-making or diagnosis
	•	Fine-grained clinical workflows (e.g., e-prescriptions)

The app MUST:
	•	Be multi-tenant: a user can belong to multiple care profiles.
	•	Use:
	•	DigitalOcean App Platform for deployment (multi-service).
	•	DigitalOcean Managed Postgres for primary data store.
	•	DigitalOcean Spaces for media.
	•	DigitalOcean Gradient AI for inference (LLM + optional speech-to-text or vision later).
	•	Have a visually clean, modern, accessible UI suitable for demo.

⸻

2. Tech Stack and Repository Layout

Assume a monorepo managed with pnpm or npm workspaces.

Suggested layout:
	•	/apps/frontend
	•	Next.js + React + TypeScript
	•	Tailwind CSS
	•	/apps/api
	•	Node.js + TypeScript
	•	Framework: Express or NestJS (your choice; default to Express if unspecified)
	•	ORM: Prisma or Drizzle for Postgres (default Prisma)
	•	/apps/worker
	•	Node.js + TypeScript
	•	Scheduled jobs (daily/weekly AI summaries)
	•	/packages/shared
	•	Shared types (TS), validation schemas, API client, etc.

Environment:
	•	Node 20+
	•	TypeScript strict mode enabled.
	•	Testing:
	•	Unit/integration: Vitest or Jest.
	•	API integration: Supertest.
	•	E2E UI: Playwright (preferred) or Cypress.

⸻

3. Core Features (v1)
	1.	Authentication & onboarding

	•	Email/password auth.
	•	Basic flows: signup, login, logout, reset password (can stub or leave reset as future).
	•	After login:
	•	If no care profile: show “Create New Care Profile” screen.
	•	If demo mode enabled: option to join “Demo Care Profile” with synthetic data.

	2.	Care Profiles

	•	CRUD for Care Profiles:
	•	Attributes: name, date of birth (optional), short description/notes.
	•	Membership:
	•	Roles: owner, caregiver, guest.
	•	Owner can invite others via email (send email or just create accounts stub for v1).
	•	Guest is read-only.

	3.	Timeline / Daily Log

	•	Per-care-profile timeline view:
	•	Group entries by date.
	•	For each entry:
	•	Time, type, tags, mood, brief text.
	•	Optional media thumbnails (photo/audio).
	•	Entry types:
	•	note, sleep, meal, symptom, activity, medication
	•	Entry fields:
	•	timestamp (with timezone)
	•	free text note
	•	mood score (1–5)
	•	context tags (e.g., “home”, “school”, “therapy”, “outing”)
	•	type-specific structured fields (see data model)

	4.	AI Daily Summary

	•	For any given date and care profile:
	•	Aggregate entries.
	•	Call Gradient for a “Daily Summary”:
	•	2–4 bullet points.
	•	1–2 key concerns.
	•	1–2 positives / wins.
	•	Display:
	•	Summary card at top of that day’s section.
	•	Ability to regenerate summary (override previous summary) for that day.

	5.	Weekly/Monthly Insights

	•	For the last 7 / 30 days:
	•	Charts:
	•	mood_score over time (line chart).
	•	sleep hours vs day (bar chart).
	•	count of symptom entries per week (bar chart).
	•	AI insights:
	•	Ask Gradient for patterns:
	•	e.g., correlation patterns: poor sleep → higher symptom frequency.
	•	suggestions/questions to discuss with clinicians.

	6.	Media Gallery (“Moments”)

	•	Filtered view per care profile:
	•	Grid of media items (photos, optionally audio icon).
	•	Show caption extracted from entry text or AI-generated one-liner (later).
	•	Filter chips:
	•	All
	•	Therapy
	•	Outdoor
	•	Progress / achievements (based on tags).

	7.	Demo Mode and Synthetic Data

	•	Ability to seed a “Demo: Alex” care profile with 30–60 days of synthetic data:
	•	Entries distributed across the day.
	•	Various entry types and moods.
	•	A few placeholder images stored in Spaces.
	•	Frontend should allow logging in as a “demo user” or selecting “View Demo Profile” (non-auth or special auth).

⸻

4. DigitalOcean Integration Requirements

App Platform:
	•	Deploy three services:
	•	frontend-service (Next.js)
	•	api-service (Node API)
	•	worker-service (Node worker)
	•	Shared environment variables via App Spec:
	•	DATABASE_URL for DO Postgres.
	•	SPACES_ENDPOINT, SPACES_ACCESS_KEY, SPACES_SECRET_KEY, SPACES_BUCKET.
	•	GRADIENT_API_KEY, GRADIENT_BASE_URL (if needed).
	•	JWT_SECRET or equivalent for auth.
	•	DEMO_SEED_ENABLED=true in staging environments.

Postgres:
	•	Use a single DO Managed Postgres instance.
	•	Migrations must be automated (e.g., prisma migrate deploy).

Spaces:
	•	Use one Spaces bucket.
	•	Use presigned URLs for client-based uploads.
	•	Media stored by key pattern:
	•	care-profiles/{care_profile_id}/entries/{entry_id}/{media_id}.{ext}

Gradient:
	•	Wrap Gradient calls in a module:
	•	gradientClient.ts with functions like:
	•	generateDailySummary(entries, profileContext) → { summary_text, insights_json }
	•	generateInsights(entries, profileContext, periodType) → { summary_text, insights_json }
	•	Make this module easy to mock in tests.

⸻

5. Data Model

Assume Postgres + Prisma (adapt types if using Drizzle).

Tables (simplified):
	1.	users

	•	id (UUID, pk)
	•	email (unique, text)
	•	name (text)
	•	password_hash (text)
	•	created_at (timestamptz)
	•	updated_at (timestamptz)

	2.	care_profiles

	•	id (UUID, pk)
	•	owner_user_id (UUID → users.id)
	•	name (text)  // e.g. “Alex”
	•	date_of_birth (date, nullable)
	•	notes (text, nullable)
	•	created_at (timestamptz)
	•	updated_at (timestamptz)
	•	UNIQUE(owner_user_id, name) optional

	3.	care_profile_members

	•	id (UUID, pk)
	•	care_profile_id (UUID → care_profiles.id)
	•	user_id (UUID → users.id)
	•	role (enum: ‘owner’ | ‘caregiver’ | ‘guest’)
	•	created_at (timestamptz)
	•	UNIQUE(care_profile_id, user_id)

	4.	entries

	•	id (UUID, pk)
	•	care_profile_id (UUID → care_profiles.id)
	•	author_user_id (UUID → users.id)
	•	timestamp (timestamptz)
	•	type (enum: ‘note’ | ‘sleep’ | ‘meal’ | ‘symptom’ | ‘activity’ | ‘medication’)
	•	free_text (text)
	•	mood_score (int: 1–5, nullable)
	•	tags (jsonb) // { mood: “anxious”, context: “home”, category: “progress” }
	•	structured_payload (jsonb) // type-specific fields:
	•	sleep: { hours: number, quality: ‘poor’|‘fair’|‘good’ }
	•	meal: { meal_type: ‘breakfast’|‘lunch’|‘dinner’|‘snack’, foods: string[] }
	•	symptom: { symptom: string, severity: int 1–10 }
	•	medication: { name: string, dose: string, taken: boolean }
	•	activity: { label: string, duration_minutes: int }
	•	created_at (timestamptz)
	•	updated_at (timestamptz)
	•	INDEX on (care_profile_id, timestamp)

	5.	media_assets

	•	id (UUID, pk)
	•	care_profile_id (UUID → care_profiles.id)
	•	entry_id (UUID → entries.id)
	•	type (enum: ‘photo’ | ‘audio’ | ‘document’)
	•	spaces_key (text)
	•	mime_type (text)
	•	created_at (timestamptz)

	6.	ai_summaries

	•	id (UUID, pk)
	•	care_profile_id (UUID → care_profiles.id)
	•	period_type (enum: ‘daily’ | ‘weekly’ | ‘monthly’)
	•	period_start (date)
	•	period_end (date)
	•	summary_text (text)
	•	insights_json (jsonb) // structured insights, e.g. { flags: [], positives: [], correlations: [] }
	•	model_name (text)
	•	created_at (timestamptz)
	•	UNIQUE(care_profile_id, period_type, period_start, period_end)

	7.	audit_logs (optional v1, but nice)

	•	id (UUID, pk)
	•	care_profile_id (UUID → care_profiles.id, nullable if global)
	•	user_id (UUID → users.id, nullable)
	•	action (text)
	•	context_json (jsonb)
	•	created_at (timestamptz)

⸻

6. API Design

Base: /api

Authentication (minimal):
	•	POST /auth/signup
	•	body: { email, password, name }
	•	response: { user, token }
	•	POST /auth/login
	•	body: { email, password }
	•	response: { user, token }
	•	GET /auth/me
	•	header: Authorization: Bearer 
	•	response: { user }

Care Profiles:
	•	GET /care-profiles
	•	returns list of care profiles current user is a member of.
	•	POST /care-profiles
	•	body: { name, date_of_birth?, notes? }
	•	creates care_profile & membership for current user as owner.
	•	GET /care-profiles/:id
	•	PATCH /care-profiles/:id
	•	DELETE /care-profiles/:id (owner-only; can be v2)

Membership / Invites (v1 simplified):
	•	POST /care-profiles/:id/members
	•	body: { email, role }
	•	if user exists, add membership; else create a placeholder user with that email.
	•	(Email sending can be stubbed.)

Entries:
	•	GET /care-profiles/:id/entries
	•	query params:
	•	from (ISO date or datetime)
	•	to (ISO date or datetime)
	•	type? (filter)
	•	response: entries ordered by timestamp ascending, possibly grouped by date on the frontend.
	•	POST /care-profiles/:id/entries
	•	body:
	•	timestamp
	•	type
	•	free_text
	•	mood_score?
	•	tags? (object)
	•	structured_payload? (object)
	•	GET /entries/:entryId
	•	PATCH /entries/:entryId
	•	DELETE /entries/:entryId

Media:
	•	POST /care-profiles/:id/media/presign
	•	body: { entry_id, type, mime_type, extension }
	•	creates media_assets row (reserve id), returns:
	•	{ uploadUrl, mediaId, finalSpacesKey }
	•	GET /care-profiles/:id/media
	•	query: { limit?, offset? }
	•	GET /media/:mediaId/url
	•	returns short-lived signed URL for download.

AI Summaries (using Gradient):
	•	POST /care-profiles/:id/summaries/daily
	•	body: { date } // date string YYYY-MM-DD
	•	behavior:
	•	fetch entries for that day.
	•	call Gradient.
	•	upsert ai_summaries daily record.
	•	return created summary.
	•	GET /care-profiles/:id/summaries
	•	query: { period_type, from?, to? }
	•	returns list of summaries.

Insights:
	•	POST /care-profiles/:id/insights
	•	body: { period_type: ‘weekly’|‘monthly’, from?, to? }
	•	fetch entries over period, get charts data server-side, call Gradient for textual insights.
	•	response:
	•	{ period_type, period_start, period_end, chartsData, aiInsights }

Admin / Demo:
	•	POST /admin/demo/seed
	•	protected by header X-ADMIN-KEY.
	•	body: { days?: number, profileName?: string }
	•	generates demo user/profile + synthetic entries.

⸻

7. Gradient Integration Details

Implement a module:

/apps/api/src/gradientClient.ts:
	•	Configuration via env:
	•	GRADIENT_API_KEY
	•	GRADIENT_BASE_URL (if applicable)
	•	DEFAULT_MODEL (e.g., a capable general-purpose LLM)
	•	Functions:

async function generateDailySummary(params: {
  careProfileName: string;
  date: string; // YYYY-MM-DD
  entries: Array<{
    timestamp: string;
    type: string;
    mood_score?: number;
    tags?: any;
    structured_payload?: any;
    free_text: string;
  }>;
}): Promise<{
  summary_text: string;
  insights_json: any;
  model_name: string;
}> { /* ... */ }

The prompt should:
	•	Take the entries as structured JSON+text.
	•	Ask the model to:
	•	Summarize the day in 3–5 bullet points.
	•	List:
	•	positives[]
	•	concerns[]
	•	behavioral_patterns[]
	•	Return a structured JSON for insights_json.

Similarly for generateInsights:

async function generateInsights(params: {
  careProfileName: string;
  periodType: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  entries: Entry[];
}): Promise<{ summary_text: string; insights_json: any; model_name: string; }> { /* ... */ }

Testing: this module must have an interface that can be mocked so tests never call Gradient by default.

⸻

8. Frontend Specification

Framework: Next.js (app router or pages router).

Main pages:
	•	/login
	•	/signup
	•	/care-profiles
	•	/care-profiles/[id]/timeline
	•	/care-profiles/[id]/insights
	•	/care-profiles/[id]/moments
	•	/doctor-view/[id]/[period] (print-friendly view; optional v1)

Timeline page:
	•	Header:
	•	Care profile name.
	•	Date range picker and “Today” quick jump.
	•	Button “Generate AI Summary for [selected day]”.
	•	Left column:
	•	Day selector (list of dates with quick scroll).
	•	Main column:
	•	For each day (starting from most recent):
	•	Day header: “Today”, “Yesterday”, or “Monday, Dec 29”.
	•	AI Summary card (if exists) with:
	•	summary text.
	•	bullet lists from insights_json.
	•	“Regenerate” button.
	•	Vertical timeline:
	•	timeline items with time, type pill, mood chip, short text, media thumbnails.

Insights page:
	•	Period selector: last 7 days, last 30 days, custom.
	•	Charts:
	•	mood_score line chart.
	•	sleep hours bar chart.
	•	symptom counts bar chart.
	•	Right-side panel:
	•	AI-generated text block summarizing patterns and suggestions.

Moments page:
	•	Grid layout of media:
	•	Click opens lightbox.
	•	Each tile shows:
	•	image
	•	date/time
	•	short caption.

Design:
	•	Use Tailwind for consistent spacing and typography.
	•	Make it responsive (mobile → simple list, desktop → multi-column).
	•	Light, calm color palette.

⸻

9. Demo Data and Seeding

Implement a script in /apps/api/scripts/seed-demo.ts:

Behavior:
	•	Ensure a demo user demo@example.com exists.
	•	Ensure a care profile “Demo: Alex” for that user.
	•	Generate N days (default 60) of entries:
	•	Use pseudo-random but consistent patterns:
	•	Sleep entries once per day (night).
	•	2–3 meals.
	•	0–3 symptom entries.
	•	2–5 notes/activities.
	•	Random moods, contexts, etc.
	•	Optionally create a few media_assets per week using pre-defined Spaces keys.

Add npm script:
	•	In /apps/api/package.json:
	•	"seed:demo": "ts-node scripts/seed-demo.ts"

Also enable via admin endpoint:
	•	POST /admin/demo/seed uses the same generator function.

⸻

10. Testing Strategy

The goal is to have solid confidence in core logic (multi-tenant behavior, permissions, data correctness, AI integration surface) without overdoing coverage.

10.1 Testing Stack
	•	Unit/integration tests: Vitest or Jest.
	•	API route tests: Supertest against an in-memory or test Postgres.
	•	E2E tests: Playwright against running dev server + test DB.

10.2 API / Backend Tests

Create a separate .env.test with a test Postgres DB.

Key test areas:
	1.	Authentication

	•	auth.test.ts:
	•	Signup with new email → returns user + token.
	•	Login with correct/incorrect credentials.
	•	/auth/me returns current user with valid token; fails with invalid/absent token.

	2.	Authorization / Multitenancy

	•	authorization.test.ts:
	•	User A creates care profile.
	•	User B cannot read/write that profile unless added as member.
	•	Member roles:
	•	caregiver: can create entries.
	•	guest: cannot create or edit; can only view.
	•	Ensure all /care-profiles/:id/* and entries endpoints enforce membership.

	3.	Entries and Timeline

	•	entries.test.ts:
	•	Create entries with different types, timestamps, structured payloads.
	•	Retrieve entries in a date range and confirm:
	•	Sorting is correct.
	•	Filters work (by type).
	•	Validate structured_payload is accepted/returned as expected.

	4.	Media

	•	media.test.ts:
	•	POST /care-profiles/:id/media/presign:
	•	Only members can request presigned URLs.
	•	Returns unique mediaId and URL.
	•	Creating media_assets rows and verifying Spaces key pattern.

	5.	AI Summaries (with Gradient mocked)

	•	ai_summaries.test.ts:
	•	Mock gradientClient.generateDailySummary.
	•	Create a few entries for a day.
	•	Call POST /care-profiles/:id/summaries/daily:
	•	Ensure it passes expected data shape to the mock.
	•	Ensures ai_summaries row is upserted.
	•	Call again and verify that summary is updated (regeneration).

	6.	Demo Seed

	•	demo_seed.test.ts:
	•	Run in test environment.
	•	After seeding:
	•	Demo user exists.
	•	Demo care profile exists.
	•	Entries exist for at least 30 days.
	•	Query some range and validate that variety of types is present.

10.3 Unit Tests for Shared Logic
	•	Utilities:
	•	Date grouping (group entries into days).
	•	Calculating mood averages per day.
	•	Deriving chart datasets from raw entries.
	•	Tests should cover typical and edge cases (no data, single day, cross-month).

10.4 Frontend Tests

Use a lightweight but useful layer of tests:
	1.	Component unit tests (with React Testing Library):

	•	Timeline component:
	•	Renders entries grouped by date.
	•	Shows badges for type and mood.
	•	Summary card:
	•	Renders bullet lists from insights_json.

	2.	E2E tests with Playwright:

	•	e2e/demo.spec.ts:
	•	Start app pointing at seeded demo DB.
	•	Log in as demo user (or hit a /demo route if you support that).
	•	Navigate to:
	•	/care-profiles
	•	Select “Demo: Alex”.
	•	/care-profiles/:id/timeline
	•	/care-profiles/:id/insights
	•	Assertions:
	•	Timeline shows multiple days.
	•	At least one AI summary card is visible (can stub API or run the real call).
	•	Charts render and contain data.

	3.	Basic accessibility checks:

	•	Use Playwright Axe or similar to run a quick accessibility audit on key pages.

10.5 Performance/Load Smoke Tests (optional)
	•	Add a small k6 script or simple Node script to:
	•	Hit /care-profiles/:id/entries?from=...&to=... repeatedly with demo data.
	•	Ensure API performs acceptably with 60–90 days of entries and a few thousand rows.

⸻

11. Implementation Checklist (for Gemini / Agents)

High-level steps:
	1.	Initialize monorepo:
	•	Setup apps/frontend, apps/api, apps/worker, packages/shared.
	•	Configure TypeScript, ESLint, Prettier.
	2.	Implement backend (API):
	•	Set up Express + Prisma + Postgres connection.
	•	Define schema and migrations.
	•	Implement auth routes.
	•	Implement care profile, membership, entries, media, summary routes.
	•	Implement Gradient client (with mockable interface).
	•	Implement demo seed generator script and admin endpoint.
	•	Add unit/integration tests.
	3.	Implement worker:
	•	Reuse DB and Gradient client code.
	•	Implement scheduled jobs (simple scheduler logic) to:
	•	Generate daily summaries for recent days.
	•	Optionally weekly summaries on a given day.
	•	Add basic tests to verify job logic.
	4.	Implement frontend:
	•	Set up Next.js + Tailwind.
	•	Implement login/signup flows.
	•	Implement care profile list and creation.
	•	Implement timeline, insights, and moments pages.
	•	Integrate with API, handle JWT storage.
	•	Add basic UI tests and one E2E flow.
	5.	Deployment:
	•	Write App Platform spec:
	•	3 services, shared env vars, build & run commands.
	•	Ensure migrations are run on deploy.
	•	Configure Spaces and Gradient env vars.
	6.	Polish:
	•	Improve styling and empty states.
	•	Add demo entry-point (“Try demo without signup” or similar).
	•	Confirm the app feels “full” with seeded data and looks good in browser.

