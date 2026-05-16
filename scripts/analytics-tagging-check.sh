#!/usr/bin/env bash
# analytics-tagging-check.sh
# Verifica se um arquivo do frontend público/admin tem tags interativas sem data-track.
# Heurística simples: compara total de <button|<a vs ocorrências de data-track.
# Não-bloqueante: imprime aviso no stderr quando há gap, mas sai 0.

set -uo pipefail
FILE="${1:-}"
if [[ -z "$FILE" || ! -f "$FILE" ]]; then exit 0; fi

case "$FILE" in
  *frontend-public/*.astro|*frontend-public/*.tsx|*frontend-public/*.jsx) ;;
  *frontend-admin/*.tsx|*frontend-admin/*.jsx) ;;
  *) exit 0 ;;
esac

total=$(grep -cE '<(button|a)[[:space:]]' "$FILE" 2>/dev/null | tr -d '[:space:]')
tagged=$(grep -c 'data-track' "$FILE" 2>/dev/null | tr -d '[:space:]')
total=${total:-0}
tagged=${tagged:-0}

if (( total > 0 && total > tagged )); then
  echo "[analytics-tagging] ⚠️  $FILE: $tagged/$total tags interativas tagueadas." >&2
  echo "[analytics-tagging] CTAs e cards do site público precisam de data-track=\"<event_name>\"." >&2
  echo "[analytics-tagging] Catálogo: packages/shared/src/schemas/analytics.ts | Skill: analytics-tagging" >&2
fi
exit 0
