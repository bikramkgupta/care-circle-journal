# Stage 5: Cloud Config

**Status**: COMPLETE
**Prerequisites**: Infrastructure online (Stage 4)

---

## Overview

Grant database permissions (required even with Path A bindable variables).

**All captured values (IDs, passwords, URLs) are stored in `.env.secrets`** - this file contains status tracking only.

---

## Tasks

### 5.1 Grant Database Permissions (CRITICAL) ✅
- [x] Permissions granted to `care_app_user`:
  - CONNECT privilege on `care_journal` database
  - USAGE on public schema
  - ALL PRIVILEGES on all tables and sequences
  - Default privileges for future tables/sequences

### 5.2 Get VPC Information ✅
- [x] VPC ID retrieved and saved to `.env.secrets`
- [x] VPC CIDR retrieved and saved to `.env.secrets`

### 5.3 Configure Trusted Sources ✅
- [x] VPC CIDR added to database firewall rules
- [x] App Platform can now connect to database

---

## Verification

| Check | Status |
|-------|--------|
| User has CONNECT privilege | [x] |
| User has schema permissions | [x] |
| VPC trusted source configured | [x] |

---

## Artifact Storage

All captured values are stored in `.env.secrets` (gitignored):
- `PG_CLUSTER_ID=5e1c412d-ddca-49fe-89b3-990838a612ba`
- `VPC_ID=<vpc-id>`
- `VPC_CIDR=<vpc-cidr>`

**To resume this stage**, read `.env.secrets` for context.

---

## Next Steps

Proceed to Stage 6: Cloud Debug Validation
