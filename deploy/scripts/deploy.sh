#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${1:-${IMAGE_TAG:-latest}}"
GH_OWNER="${GH_OWNER:-kayorid}"
GH_REPO="${GH_REPO:-aumaf-3d-site}"

export IMAGE_BACKEND="ghcr.io/${GH_OWNER}/${GH_REPO}/backend:${IMAGE_TAG}"
export IMAGE_FRONTEND_PUBLIC="ghcr.io/${GH_OWNER}/${GH_REPO}/frontend-public:${IMAGE_TAG}"
export IMAGE_FRONTEND_ADMIN="ghcr.io/${GH_OWNER}/${GH_REPO}/frontend-admin:${IMAGE_TAG}"

DEPLOY_DIR="/srv/aumaf/compose"
ENV_FILE="/srv/aumaf/env/.env.production"

cd "${DEPLOY_DIR}"

echo "[deploy] pulling images tag=${IMAGE_TAG}"
docker compose --env-file "${ENV_FILE}" pull

echo "[deploy] running migrations"
docker compose --env-file "${ENV_FILE}" run --rm backend-migrate

echo "[deploy] up -d --remove-orphans"
docker compose --env-file "${ENV_FILE}" up -d --remove-orphans

echo "[deploy] pruning old images"
docker image prune -af --filter "until=168h"

echo "[deploy] smoke /health"
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS http://127.0.0.1:3000/health > /dev/null; then
    echo "[deploy] backend healthy"
    exit 0
  fi
  sleep 6
done

echo "[deploy] backend not healthy after 60s"
docker compose --env-file "${ENV_FILE}" logs --tail=80 backend
exit 1
