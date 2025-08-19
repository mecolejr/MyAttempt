# TruePlace (PlaceMe)

Personalized relocation intelligence. Monorepo with `backend` (Express + Prisma + Postgres) and `frontend` (React + Vite + React-Leaflet).

## Quick start
- See `docs/Runbook.md` for a known-good local flow (Docker PostGIS, backend dev, static frontend preview).

## Features (Phase 2/3)
- Core API: health, locations, profile-scores, location detail, admin dataset snapshot
- Scoring with sub-scores: Safety, Community (Diversity), Policy
- Map choropleth; ranked list with filters, search, favorites, CSV/JSON export
- Shareable URLs (parameters in query string)
- Admin transparency (fingerprint, lastUpdated); optional token gate

## Scoring weights (current)
- Safety: ~25–40% (varies with profile)
- Community (Diversity): 45% (60% if `valuesDiversity=true`)
- Policy: 15%
All sub-scores are 0–100 and combined into the TruePlace score.

## Data
- Stub CSVs for initial data; live FBI/Census fetchers are scaffolded behind API keys
- Nightly-safe refresh logs dataset fingerprint to `backend/data/.fingerprint`

## CI/CD
- GitHub Actions builds/tests each workspace; optional Docker images to GHCR on `main`
  - Images: `ghcr.io/<owner>/trueplace-backend:latest` and `ghcr.io/<owner>/trueplace-frontend:latest`
  - To run from GHCR locally:
    - Prereq: you must be authenticated to GHCR or the images must be public
    - Pull + start (absolute path recommended):
      - `docker compose -f /Users/<you>/Projects/trueplace/docker-compose.ghcr.yml pull`
      - `docker compose -f /Users/<you>/Projects/trueplace/docker-compose.ghcr.yml up -d`
  - Pushing local images to GHCR (skip if CI publishes for you):
    - Create a GitHub PAT with scopes: `write:packages` and `read:packages` (approve for SSO if required)
    - `export GHCR_TOKEN=ghp_...` then `echo "$GHCR_TOKEN" | docker login ghcr.io -u <your-gh-username> --password-stdin`
    - `docker tag trueplace-backend:latest ghcr.io/<owner>/trueplace-backend:latest`
    - `docker tag trueplace-frontend:latest ghcr.io/<owner>/trueplace-frontend:latest`
    - `docker push ghcr.io/<owner>/trueplace-backend:latest`
    - `docker push ghcr.io/<owner>/trueplace-frontend:latest`
  - Apple Silicon note: if you see a platform warning for the PostGIS image, add under the `db` service:
    - `platform: linux/arm64` (or `linux/amd64` if using emulation)
  - Known gotchas we hit and how to avoid:
    - “denied” on `docker compose ... pull`: not logged into GHCR or images private. Login with PAT above or use CI to publish, or make images public.
    - “version is obsolete” warning in compose: harmless; we keep it for backward-compat but can remove the `version` key.
    - TypeScript build in Docker failing on tests/types: backend `tsconfig.json` excludes tests from build; we also avoid Express type aliasing that confuses tsc in Alpine.

## Deploy (local production)
- Ensure Docker is installed and running
- Run: `./scripts/prod.sh`
- Backend will be on `http://localhost:4000`; front-end container serves static build
- Env you may set:
  - `DEV_AUTH=false` in production by default
  - `CORS_ORIGIN=http://localhost:5178`
  - `CACHE_TTL_MS=600000` (10 min)

## Deploy (public domain with TLS)
- Prereqs: a Linux server with Docker, a domain pointing to the server (A record), GHCR images public or `docker login ghcr.io`
- Create `deploy/.env` from `deploy/.env.example`, set `DOMAIN`, `EMAIL`, DB creds, and `ADMIN_TOKEN`
- Start stack with proxy + TLS:
  - `docker compose -f deploy/docker-compose.deploy.yml --env-file deploy/.env up -d`
- Verify:
  - `curl -s https://$DOMAIN/api/health`
  - `curl -s https://$DOMAIN/api/ready`

## Next decisions
- We can either rely on CI to publish GHCR images automatically on `main`, or keep local-only images for dev and skip GHCR. This doc captures both paths so we can switch later without churn.


