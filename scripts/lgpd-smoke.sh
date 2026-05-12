#!/usr/bin/env bash
# LGPD compliance smoke test.
# Roda contra um ambiente vivo (local ou prod) e valida 4 garantias:
#   1) Paginas legais publicas retornam 200.
#   2) POST /v1/consent aceita payload valido e retorna 201.
#   3) GET /v1/dsr/requests exige autenticacao (401 sem cookie).
#   4) POST /v1/dsr/request publico aceita payload valido e retorna 201.
#
# Uso:
#   BASE_URL=http://localhost:4321 API_URL=http://localhost:3000 ./scripts/lgpd-smoke.sh
#   # prod:
#   BASE_URL=https://aumaf.kayoridolfi.ai API_URL=https://aumaf.kayoridolfi.ai ./scripts/lgpd-smoke.sh
set -euo pipefail

BASE="${BASE_URL:-http://localhost:4321}"
API="${API_URL:-http://localhost:3000}"

fail() { echo "FAIL: $*" >&2; exit 1; }
pass() { echo "PASS: $*"; }

echo "BASE = $BASE"
echo "API  = $API"
echo

# 1. Paginas legais 200.
for p in politica-de-privacidade termos-de-uso politica-de-cookies preferencias-de-cookies lgpd/direitos; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/$p")
  [ "$code" = "200" ] || fail "$BASE/$p retornou $code (esperado 200)"
  pass "$BASE/$p HTTP 200"
done

# 2. POST /v1/consent valido.
resp=$(curl -s -w "\n%{http_code}" -X POST "$API/api/v1/consent" \
  -H 'content-type: application/json' \
  -d '{"categories":{"necessary":true,"functional":true,"analytics":false,"marketing":false},"policyVersion":"1.0","source":"banner_custom"}')
code=$(printf "%s" "$resp" | tail -n1)
[ "$code" = "201" ] || fail "POST /v1/consent retornou $code (esperado 201). resp=$resp"
pass "POST /v1/consent 201"

# 3. GET /v1/dsr/requests sem auth = 401.
code=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/v1/dsr/requests")
[ "$code" = "401" ] || fail "GET /v1/dsr/requests sem auth retornou $code (esperado 401)"
pass "GET /v1/dsr/requests sem auth retorna 401"

# 4. POST /v1/dsr/request publico valido.
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/v1/dsr/request" \
  -H 'content-type: application/json' \
  -d '{"email":"smoke@aumaf3d.com.br","fullName":"Smoke Test","requestType":"access","description":"smoke test"}')
[ "$code" = "201" ] || fail "POST /v1/dsr/request retornou $code (esperado 201)"
pass "POST /v1/dsr/request 201"

echo
echo "SMOKE OK"
