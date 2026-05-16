#!/usr/bin/env bash
# analytics-audit.sh
# Audita o repo: lista arquivos do frontend-public com tags interativas sem data-track.
# Heurística: conta linhas com <button ou <a e linhas com data-track no mesmo arquivo.
# Se total > tagueados, há gap. Não-bloqueante.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "═══════════════════════════════════════════════════════════"
echo " Auditoria de Analytics Tagging — AUMAF 3D"
echo "═══════════════════════════════════════════════════════════"
echo

GAPS=()
TOTAL_FILES=0
while IFS= read -r f; do
  TOTAL_FILES=$((TOTAL_FILES + 1))
  # Conta <button (excluindo close menu/etc) e <a interativos
  total=$(grep -cE '<(button|a)[[:space:]]' "$f" 2>/dev/null | tr -d '[:space:]')
  tagged=$(grep -c 'data-track' "$f" 2>/dev/null | tr -d '[:space:]')
  total=${total:-0}
  tagged=${tagged:-0}
  if (( total > 0 && total > tagged )); then
    GAPS+=("$tagged/$total tagueados — $f")
  fi
done < <(find frontend-public/src -type f \( -name '*.astro' -o -name '*.tsx' \) 2>/dev/null \
          | grep -vE '_legacy|/components/SEO|/components/Breadcrumb|/components/SectionSeparator')

if [[ ${#GAPS[@]} -eq 0 ]]; then
  echo "✅ Todos os $TOTAL_FILES arquivos auditados estão com tagging adequado."
else
  echo "⚠️  ${#GAPS[@]}/$TOTAL_FILES arquivo(s) possivelmente com gaps de tagging:"
  echo
  printf '   %s\n' "${GAPS[@]}"
  echo
  echo "→ Heurística (pode ter falsos positivos). Skill 'analytics-tagging' tem o checklist."
fi
echo
exit 0
