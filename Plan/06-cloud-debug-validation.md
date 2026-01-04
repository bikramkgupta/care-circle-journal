# Stage 6: Cloud Debug Validation

**Status**: IN_PROGRESS (Ready for GitHub Actions deployment)
**Prerequisites**: Cloud config complete (Stage 5), Secrets configured (Stage 7)

---

## Overview

Deploy a debug container to validate VPC connectivity, Spaces access, and Gradient integration before deploying the production app. **Critical for Tier 3 complex applications.**

**All captured values (IDs, passwords, URLs) are stored in `.env.secrets`** - this file contains status tracking only.

---

## Tasks

### 6.1 Create Debug App Spec ✅
- [x] Debug app spec created: `.do/app-debug.yaml`
- [x] Spec validated: `doctl apps spec validate .do/app-debug.yaml`

### 6.2 Deploy Debug Container

**Option A: Via GitHub Actions (Recommended) ✅**
- [x] Workflow created: `.github/workflows/deploy-debug.yml`
- [x] Workflow uses `digitalocean/app_action/deploy@v2` to inject secrets
- [x] All GitHub secrets configured (including DIGITALOCEAN_ACCESS_TOKEN)
- [x] Workflow files committed to repository
- [x] Workflow parameter fixed (`app_spec_location` instead of `spec_path`)
- [ ] **BLOCKED**: Debug container image (`ghcr.io/bikramkgupta/do-app-debug-container-python`) is private
  - App Platform cannot access private GHCR images without registry authentication
  - **Action Required**: Make the image public OR use a public debug image
- [ ] Deploy via GitHub Actions (after image is accessible)
- [ ] Debug App ID captured after deployment

**Option B: Via Local doctl (Not Recommended)**
- [x] Script created: `scripts/deploy-debug-local.sh`
- [x] Note: Debug container image requires GHCR authentication
- [x] doctl cannot access private GHCR images directly
- [ ] Use GitHub Actions method after image is made public

### 6.3 Run Connectivity Tests

Connect to debug container and verify all services:

```bash
# Get debug app ID
DEBUG_APP_ID=$(doctl apps list --format ID,Spec.Name --no-header | grep care-circle-debug | awk '{print $1}')

# Connect via console
doctl apps console $DEBUG_APP_ID debug

# Inside container - run diagnostics:
./diagnose.sh

# Test PostgreSQL (Private VPC URL)
psql "$DATABASE_URL" -c "SELECT 1"

# Test Spaces
./test-spaces.sh

# Test Gradient AI
curl -X POST "https://inference.do-ai.run/v1/chat/completions" \
  -H "Authorization: Bearer $GRADIENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3.3-70b-instruct", "messages": [{"role": "user", "content": "Hello"}], "max_tokens": 10}'
```

- [ ] PostgreSQL connection test passed
- [ ] Spaces read/write test passed
- [ ] Gradient AI test passed

---

## Validation Checklist

| Service | Test Command | Status |
|---------|--------------|--------|
| PostgreSQL (VPC) | `psql "$DATABASE_URL" -c "SELECT 1"` | [ ] Pass |
| Spaces (R/W) | `./test-spaces.sh` | [ ] Pass |
| Gradient AI | `curl` to inference endpoint | [ ] Pass |

---

## Deployment Methods

### Method 1: GitHub Actions (Recommended) ✅

**Prerequisites:**
- ✅ All GitHub secrets configured (including DIGITALOCEAN_ACCESS_TOKEN)
- ✅ Workflow file created: `.github/workflows/deploy-debug.yml`
- [ ] Workflow files committed to repository

**Steps:**
1. Commit workflow files:
   ```bash
   git add .github/workflows/deploy-debug.yml .do/app-debug.yaml
   git commit -m "Add debug container deployment"
   git push origin main
   ```
2. Trigger workflow:
   - Go to: GitHub → Actions → "Deploy Debug Container"
   - Click "Run workflow"
   - OR: Push changes to trigger automatically
3. Monitor deployment in GitHub Actions tab
4. Get app ID: `doctl apps list | grep care-circle-debug`

### Method 2: Local doctl (Not Recommended)

**Note**: The debug container image (`ghcr.io/bikramkgupta/do-app-debug-container-python`) requires GHCR authentication which doctl cannot handle directly. Use GitHub Actions method instead.

---

## Artifact Storage

All captured values are stored in `.env.secrets` (gitignored):
- `DEBUG_APP_ID` (to be added after deployment)

**To resume this stage**, read `.env.secrets` for context.

---

## Troubleshooting

### Image Access Error
- **Symptom**: `The provided credentials can't access the image`
- **Cause**: GHCR image requires authentication or is private
- **Fix**: Use GitHub Actions method (handles GHCR auth automatically)

### PostgreSQL Connection Fails
- Check trusted sources include VPC CIDR
- Verify `production: true` in database spec
- Check cluster_name, db_name, db_user match exactly

### Spaces Connection Fails
- Verify access key and secret key are correct
- Check bucket exists and is in correct region

### Gradient AI Fails
- Verify API key is valid
- Check model name is correct

---

## Next Steps

1. Commit workflow files to repository
2. Deploy debug container via GitHub Actions
3. Run connectivity tests
4. After validation passes: Proceed to Stage 8: Cloud Deploy Production
