#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/1stowner/Projects/trueplace"

echo "[prod] Building images..."
docker compose -f "$ROOT/docker-compose.prod.yml" build

echo "[prod] Starting stack..."
docker compose -f "$ROOT/docker-compose.prod.yml" up -d

echo "[prod] Done. Backend at http://localhost:4000"


