# Operations Guide

- Weekly cadence:
  - Monday: review Renovate PRs; check CI; merge safe updates
  - Wednesday: triage issues; plan next release
  - Friday: cut release branch; update CHANGELOG; tag and deploy

- Secrets: rotate twice a year; store only in environment variables (local .env, prod via Vercel/host)
- Monitoring: add Sentry (SENTRY_DSN), optional UptimeRobot to ping /api/health
- Backups: enable daily database backups; retain 30 days
