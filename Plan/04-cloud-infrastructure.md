# Stage 4: Cloud Infrastructure

**Status**: COMPLETE
**Prerequisites**: Local testing complete (Stage 3)

---

## Overview

Create managed cloud resources: PostgreSQL database, Spaces object storage, and AI services.

**All captured values (IDs, passwords, URLs) are stored in `.env.secrets`** - this file contains status tracking only.

---

## Tasks

### 4.1 Create PostgreSQL Cluster ✅
- [x] Cluster created: `care-circle-db`
- [x] Cluster ID: `5e1c412d-ddca-49fe-89b3-990838a612ba`
- [x] Status: Online
- [x] Cluster ID saved to `.env.secrets` as `PG_CLUSTER_ID`

### 4.2 Create Database and User (Path A - Bindable Variables) ✅
- [x] Database `care_journal` created
- [x] User `care_app_user` created via doctl

### 4.3 Create Spaces Bucket ✅
- [x] Bucket created: `care-circle-media`
- [x] Region: `nyc3` (matches database region)
- [x] Bucket name saved to `.env.secrets`

### 4.4 Create Spaces Access Keys ✅
- [x] Access Key created (key name: `care-circle-spaces-key`)
- [x] Grants: `bucket=care-circle-media;permission=readwrite`
- [x] Keys saved to `.env.secrets` (not in this file for security)

### 4.5 Get Gradient AI Model Access Key ✅
- [x] Gradient API key added to `.env` file by user
- [ ] Key saved to `.env.secrets` (to be done)

---

## Verification

| Check | Status |
|-------|--------|
| PostgreSQL cluster online | [x] |
| Database `care_journal` exists | [x] |
| User `care_app_user` exists | [x] |
| Spaces bucket exists | [x] |
| Spaces bucket in nyc3 | [x] |
| Spaces keys created | [x] |
| Gradient API key available | [x] |

---

## Artifact Storage

All captured values are stored in `.env.secrets` (gitignored):
- `PG_CLUSTER_ID` (cluster ID)
- `SPACES_BUCKET`, `SPACES_REGION`, `SPACES_ENDPOINT`
- `SPACES_ACCESS_KEY`, `SPACES_SECRET_KEY` (sensitive - never commit)
- `GRADIENT_API_KEY` (sensitive - never commit)

**Note**: Actual secret values are in `.env.secrets` (gitignored) and will be added to GitHub Secrets in Stage 7.

**To resume this stage**, read `.env.secrets` for context.

---

## Commands Used

```bash
# PostgreSQL
doctl databases create care-circle-db --engine pg --version 16 --region nyc3 --size db-s-1vcpu-2gb --num-nodes 1
doctl databases db create $CLUSTER_ID care_journal
doctl databases user create $CLUSTER_ID care_app_user

# Spaces
s3cmd mb s3://care-circle-media  # Created in nyc3
doctl spaces keys create care-circle-spaces-key --grants "bucket=care-circle-media;permission=readwrite"
```

---

## Next Steps

Proceed to Stage 5: Cloud Config (already complete)
Then Stage 6: Cloud Debug Validation
