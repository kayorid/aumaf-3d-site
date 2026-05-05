#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <path/to/db-YYYYMMDD-HHMMSS.dump>"
  echo "Available manual snapshots:"
  ls -lh /srv/aumaf/backups/manual/ 2>/dev/null || echo "(none)"
  exit 1
fi

DUMP_FILE="$1"
ENV_FILE="/srv/aumaf/env/.env.production"

if [ ! -f "${DUMP_FILE}" ]; then
  echo "Dump file not found: ${DUMP_FILE}"
  exit 1
fi

# shellcheck disable=SC1090
source "${ENV_FILE}"

echo "[restore] target db=${POSTGRES_DB} user=${POSTGRES_USER}"
echo "[restore] dump=${DUMP_FILE}"
read -p "[restore] DESTRUCTIVE: drop and recreate ${POSTGRES_DB}? type DESTRUIR to continue: " CONFIRM
if [ "${CONFIRM}" != "DESTRUIR" ]; then
  echo "[restore] aborted"
  exit 1
fi

cd /srv/aumaf/compose

echo "[restore] stopping backend"
docker compose --env-file "${ENV_FILE}" stop backend

echo "[restore] dropping & recreating db"
docker compose --env-file "${ENV_FILE}" exec -T postgres \
  psql -U "${POSTGRES_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${POSTGRES_DB};"
docker compose --env-file "${ENV_FILE}" exec -T postgres \
  psql -U "${POSTGRES_USER}" -d postgres -c "CREATE DATABASE ${POSTGRES_DB};"

echo "[restore] importing dump"
docker compose --env-file "${ENV_FILE}" exec -T postgres \
  pg_restore -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --no-owner --no-acl < "${DUMP_FILE}"

echo "[restore] running migrations"
docker compose --env-file "${ENV_FILE}" run --rm backend-migrate

echo "[restore] restarting backend"
docker compose --env-file "${ENV_FILE}" up -d backend

echo "[restore] done"
