# Stage 1: Local Design

**Status**: COMPLETE
**Prerequisites**: None

---

## Overview

Define the application architecture, UI/UX decisions, and data model for CareCircle Journal.

---

## Tasks

### 1.1 Product Definition
- [x] Review Task.md for core features
- [x] Define user roles (Owner, Caregiver, Guest)
- [x] Map out user flows (Onboarding, Daily Log, Insights)

### 1.2 Architecture Decisions
- [x] Monorepo structure confirmed:
    - `apps/frontend` (Next.js)
    - `apps/api` (Node.js/Express)
    - `apps/worker` (Node.js)
    - `packages/shared`
- [x] Database choice: PostgreSQL (Managed)
- [x] Object Storage: DigitalOcean Spaces (for media)
- [x] AI Service: Gradient AI (for summaries)

### 1.3 Data Model Design
- [x] Design `users` table
- [x] Design `care_profiles` table
- [x] Design `care_profile_members` table
- [x] Design `entries` table (JSONB for structured payloads)
- [x] Design `media_assets` table
- [x] Design `ai_summaries` table

---

## Artifacts

- [x] Prisma Schema (`apps/api/prisma/schema.prisma`)
- [ ] API OpenApi/Swagger Spec (optional - skipped for v1)
- [x] High-level architecture diagram (in main plan)

---

## Tier Classification

**This is a Tier 3 (Complex) application** per deployment-planner skill:
- Multi-service (api, frontend, worker)
- PostgreSQL managed database
- Spaces object storage  
- Gradient AI integration
- Requires GitHub Actions deployment (not doctl direct)
