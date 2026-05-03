#!/usr/bin/env bash
# AUMAF 3D — Smoke Test
# ───────────────────────
# Verifica que toda a stack (backend, public, admin, infra) está saudável.
# Sai com código 0 se tudo de pé; código != 0 se qualquer check falhar.
#
# Uso:
#   bash scripts/smoke-test.sh                 # endpoints default
#   BACKEND_URL=https://api.aumaf-3d.com.br bash scripts/smoke-test.sh

set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
PUBLIC_URL="${PUBLIC_URL:-http://localhost:4321}"
ADMIN_URL="${ADMIN_URL:-http://localhost:5174}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@aumaf.com.br}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-AumafAdmin2026!}"

PASS=0
FAIL=0
FAILED=()

bold() { printf '\033[1m%s\033[0m' "$1"; }
green() { printf '\033[32m%s\033[0m' "$1"; }
red() { printf '\033[31m%s\033[0m' "$1"; }
gray() { printf '\033[90m%s\033[0m' "$1"; }

check() {
  local name="$1"
  local cmd="$2"
  printf '  %s ' "$(gray "·")"
  printf '%-45s' "$name"
  if eval "$cmd" >/dev/null 2>&1; then
    printf '%s\n' "$(green '✔')"
    PASS=$((PASS + 1))
  else
    printf '%s\n' "$(red '✗')"
    FAIL=$((FAIL + 1))
    FAILED+=("$name")
  fi
}

check_status() {
  local name="$1"
  local url="$2"
  local expected="${3:-200}"
  local actual
  actual=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url" 2>/dev/null || echo "000")
  printf '  %s ' "$(gray "·")"
  printf '%-45s' "$name"
  if [[ "$actual" == "$expected" ]]; then
    printf '%s %s\n' "$(green '✔')" "$(gray "($actual)")"
    PASS=$((PASS + 1))
  else
    printf '%s %s\n' "$(red '✗')" "$(red "($actual ≠ $expected)")"
    FAIL=$((FAIL + 1))
    FAILED+=("$name (got $actual, expected $expected)")
  fi
}

echo
echo "$(bold 'AUMAF 3D — Smoke Test')"
echo "$(gray 'backend:')  $BACKEND_URL"
echo "$(gray 'public: ')  $PUBLIC_URL"
echo "$(gray 'admin:  ')  $ADMIN_URL"
echo

echo "$(bold '› Backend')"
check_status 'GET /health (canonical)' "$BACKEND_URL/health"
check_status 'GET /api/health (alias)' "$BACKEND_URL/api/health"
check_status 'GET /api/v1/public/posts' "$BACKEND_URL/api/v1/public/posts"

echo
echo "$(bold '› Site público (Astro)')"
check_status 'GET / (homepage)' "$PUBLIC_URL/"
check_status 'GET /blog' "$PUBLIC_URL/blog"

echo
echo "$(bold '› Admin (Vite)')"
check_status 'GET / (redirect ou login)' "$ADMIN_URL/login"

echo
echo "$(bold '› Auth backend')"
LOGIN_PAYLOAD="$(printf '{"email":"%s","password":"%s"}' "$ADMIN_EMAIL" "$ADMIN_PASSWORD")"
check 'POST /api/v1/auth/login retorna 200' \
  "curl -sf -X POST -H 'Content-Type: application/json' -d '$LOGIN_PAYLOAD' $BACKEND_URL/api/v1/auth/login"

echo
echo "$(bold '› Health agregado')"
HEALTH_BODY="$(curl -s --max-time 10 "$BACKEND_URL/health" || echo '{}')"
check 'health.services.db.status == up' \
  "echo '$HEALTH_BODY' | grep -q '\"db\":{\"status\":\"up\"'"
check 'health.services.redis.status == up' \
  "echo '$HEALTH_BODY' | grep -q '\"redis\":{\"status\":\"up\"'"

echo
echo "$(bold '› Resultado')"
TOTAL=$((PASS + FAIL))
if [[ $FAIL -eq 0 ]]; then
  echo "  $(green "✔ $PASS/$TOTAL checks passaram")"
  echo
  exit 0
else
  echo "  $(red "✗ $FAIL/$TOTAL checks falharam:")"
  for f in "${FAILED[@]}"; do
    echo "    $(red '·') $f"
  done
  echo
  exit 1
fi
