# Stage 7: Cloud Secrets & CI/CD

**Status**: COMPLETE
**Prerequisites**: Infrastructure complete (Stage 4)

---

## Overview

Configure GitHub secrets and create the CI/CD workflow for production deployment.

**CRITICAL**: Tier 3 apps MUST use GitHub Actions for deployment. The `digitalocean/app_action/deploy@v2` action injects secrets from GitHub into the app spec. Direct `doctl apps create` leaves `${SECRET_NAME}` as literal strings.

---

## Part A: GitHub Secrets

### Required Secrets

| Secret Name | Source | Set? |
|-------------|--------|------|
| `DIGITALOCEAN_ACCESS_TOKEN` | DO Console -> API -> Tokens | [ ] Manual step |
| `JWT_SECRET` | Generated: `openssl rand -hex 32` | [x] |
| `GRADIENT_API_KEY` | Stage 4 (.env.secrets) | [x] |
| `SPACES_ACCESS_KEY` | Stage 4 (.env.secrets) | [x] |
| `SPACES_SECRET_KEY` | Stage 4 (.env.secrets) | [x] |

### Set Secrets

✅ **Completed via `gh secret set`:**
- JWT_SECRET
- GRADIENT_API_KEY
- SPACES_ACCESS_KEY
- SPACES_SECRET_KEY

📋 **TODO - Manual Step:**
Set `DIGITALOCEAN_ACCESS_TOKEN`:
1. Go to: https://cloud.digitalocean.com/account/api/tokens
2. Generate new token (or use existing)
3. Run: `gh secret set DIGITALOCEAN_ACCESS_TOKEN`

---

## Part B: CI/CD Workflow

### Production Workflow

✅ Created: `.github/workflows/deploy.yml`

The workflow:
- Triggers on push to `main` branch or manual `workflow_dispatch`
- Uses `digitalocean/app_action/deploy@v2` to deploy
- Injects secrets from GitHub Secrets into app spec `${VAR}` placeholders
- Uses `production` environment for approval gates (if configured)

### Debug Workflow

✅ Created: `.github/workflows/deploy-debug.yml`

The workflow:
- Deploys debug container for connectivity testing
- Uses same secret injection pattern
- Can be triggered manually or on push to `.do/app-debug.yaml`

- [x] Production workflow file created
- [x] Debug workflow file created
- [x] Both committed to repository

---

## Verification

```bash
# Check secrets are set
gh secret list
```

| Check | Status |
|-------|--------|
| DIGITALOCEAN_ACCESS_TOKEN set | [ ] Manual step required |
| JWT_SECRET set | [x] |
| GRADIENT_API_KEY set | [x] |
| SPACES_ACCESS_KEY set | [x] |
| SPACES_SECRET_KEY set | [x] |
| Production workflow exists | [x] |
| Debug workflow exists | [x] |

---

## Key Points

1. **`deploy_on_push: false`** must be set in `.do/app.yaml` for all components ✅
2. GitHub Actions workflow handles deployments, not App Platform auto-deploy
3. Secrets in app spec use `${SECRET_NAME}` syntax, resolved by app_action
4. Database credentials use bindable variables `${db.DATABASE_URL}` (auto-resolved)
5. All secrets stored in `.env.secrets` (gitignored) - never committed

---

## Next Steps

1. Set `DIGITALOCEAN_ACCESS_TOKEN` GitHub secret (manual)
2. Proceed to Stage 6: Cloud Debug Validation (deploy via GitHub Actions)
3. Then Stage 8: Cloud Deploy Production
