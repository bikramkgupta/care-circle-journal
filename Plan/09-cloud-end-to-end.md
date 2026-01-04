# Stage 9: Cloud End-to-End Validation

**Status**: TODO
**Prerequisites**: Production app deployed (Stage 8)

---

## Overview

Validate the complete data flow from ingestion through processing to output.

---

## Application URL

```bash
APP_ID=$(doctl apps list --format ID,Spec.Name --no-header | grep care-circle-journal | awk '{print $1}')
APP_URL=$(doctl apps get $APP_ID --format DefaultIngress --no-header)
echo "App URL: $APP_URL"
```

App URL: `https://care-circle-journal-_____.ondigitalocean.app`

---

## Tests

### 9.1 Database Migrations

Run Prisma migrations against production database:

```bash
# Option 1: Via PRE_DEPLOY job (if configured)
# Option 2: Via debug container
doctl apps console $DEBUG_APP_ID debug
cd /app && npx prisma migrate deploy
```

- [ ] Migrations applied

### 9.2 Seed Demo Data

```bash
# Via API endpoint (if admin endpoint exists)
curl -X POST "$APP_URL/api/admin/demo/seed" \
  -H "X-ADMIN-KEY: $ADMIN_KEY"

# Or via debug container
node apps/api/scripts/seed-demo.js
```

- [ ] Demo user created (`demo@example.com`)
- [ ] Demo care profile created (`Demo: Alex`)
- [ ] 30 days of entries seeded

### 9.3 API Testing

```bash
# Login
TOKEN=$(curl -s -X POST "$APP_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}' \
  | jq -r '.token')

# Get user info
curl "$APP_URL/auth/me" -H "Authorization: Bearer $TOKEN"

# List care profiles
curl "$APP_URL/care-profiles" -H "Authorization: Bearer $TOKEN"

# Get entries
PROFILE_ID=$(curl -s "$APP_URL/care-profiles" -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')
curl "$APP_URL/entries/$PROFILE_ID" -H "Authorization: Bearer $TOKEN"
```

- [ ] Login returns token
- [ ] Auth/me returns user
- [ ] Care profiles listed
- [ ] Entries retrieved

### 9.4 AI Summary Generation

```bash
# Generate daily summary
curl -X POST "$APP_URL/summaries/$PROFILE_ID/daily" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-01-02"}'
```

- [ ] AI summary generated successfully

### 9.5 Worker Processing

Check worker logs for scheduled summary generation:

```bash
doctl apps logs $APP_ID --component worker --follow
```

- [ ] Worker running
- [ ] Cron jobs executing

### 9.6 Frontend Validation

Open browser: `$APP_URL`

- [ ] Landing page loads
- [ ] Login works with demo credentials
- [ ] Timeline displays entries grouped by date
- [ ] AI Summary card appears (if summaries exist)
- [ ] Insights page shows charts
- [ ] Moments gallery displays (if media exists)

---

## Final Validation Checklist

| Test | Status |
|------|--------|
| API responds correctly | [ ] |
| Authentication works | [ ] |
| Database reads/writes | [ ] |
| AI summaries generate | [ ] |
| Worker processing | [ ] |
| Frontend displays data | [ ] |
| Media uploads work | [ ] |

---

## Deployment Complete

- [ ] All tests passed
- [ ] Production app is fully functional
- [ ] Demo mode working

---

## Post-Deployment Tasks

1. **Configure custom domain** (optional)
   ```bash
   doctl apps update $APP_ID --spec .do/app.yaml  # with domains section
   ```

2. **Set up monitoring/alerts**
   - Enable alerts in App Platform console
   - Configure error notification

3. **Archive debug container** (to save costs)
   ```bash
   doctl apps delete $DEBUG_APP_ID
   ```

4. **Document access**
   - App URL
   - Demo credentials
   - Admin access (if applicable)
