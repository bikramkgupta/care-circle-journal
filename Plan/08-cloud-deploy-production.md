# Stage 8: Cloud Deploy Production

**Status**: TODO
**Prerequisites**: Secrets & CI/CD configured (Stage 7)

---

## Overview

Deploy the full production application with all services and workers.

---

## Pre-Deployment Checklist

- [ ] `.do/app.yaml` has correct configuration
- [ ] `deploy_on_push: false` set for ALL components
- [ ] All GitHub secrets configured (Stage 7)
- [ ] Debug container connectivity passed (Stage 6)
- [ ] Local build validation passed (`doctl app dev build`)

---

## Deploy via GitHub Actions

```bash
# Commit all changes
git add .
git commit -m "Production deployment: CareCircle Journal v1"

# Push to main branch to trigger deployment
git push origin main
```

- [ ] Deployment triggered

---

## Monitor Deployment

```bash
# Get app ID (after first deployment)
APP_ID=$(doctl apps list --format ID,Spec.Name --no-header | grep care-circle-journal | awk '{print $1}')

# Watch build logs
doctl apps logs $APP_ID --type build --follow

# Watch deployment logs
doctl apps logs $APP_ID --type deploy --follow

# Watch runtime logs
doctl apps logs $APP_ID --type run --follow
```

---

## Health Check Verification

| Service | Endpoint | Expected | Status |
|---------|----------|----------|--------|
| api | /health | 200 OK | [ ] |
| frontend | /health | 200 OK | [ ] |
| worker | (internal) | Running | [ ] |

---

## Deployment Result

- [ ] App URL: `https://care-circle-journal-_____.ondigitalocean.app`
- [ ] All services healthy
- [ ] Worker running

---

## Troubleshooting

### Build Fails
```bash
doctl apps logs $APP_ID --type build
```
- Check Dockerfile syntax
- Verify dependencies are installed

### Health Check Fails
```bash
doctl apps logs $APP_ID --type deploy
```
- Verify health endpoint exists and returns 200
- Check `initial_delay_seconds` is sufficient

### Secrets Not Resolved
- Verify `deploy_on_push: false` in app spec
- Check GitHub Actions workflow passes secrets in `env:` block
- Confirm secrets are set: `gh secret list`

---

## Next Steps

Proceed to Stage 9: Cloud End-to-End Validation
