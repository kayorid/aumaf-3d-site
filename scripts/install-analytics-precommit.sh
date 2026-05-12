#!/usr/bin/env bash
# Instala um git hook pre-commit local que avisa sobre CTAs sem tagging em arquivos staged.
# Não-bloqueante (warning only). Opcional — rode uma vez quando clonar o repo.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOK="$ROOT/.git/hooks/pre-commit"

cat > "$HOOK" <<'EOF'
#!/usr/bin/env bash
# AUMAF 3D — analytics tagging warning (não bloqueante)
ROOT="$(git rev-parse --show-toplevel)"
CHECK="$ROOT/scripts/analytics-tagging-check.sh"
[[ -x "$CHECK" ]] || exit 0

GAPS=0
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  out=$(bash "$CHECK" "$ROOT/$f" 2>&1 || true)
  if [[ -n "$out" ]]; then
    echo "$out"
    GAPS=$((GAPS + 1))
  fi
done < <(git diff --cached --name-only --diff-filter=AM)

if [[ "$GAPS" -gt 0 ]]; then
  echo
  echo "→ $GAPS arquivo(s) podem ter CTAs sem data-track. Commit não foi bloqueado."
  echo "→ Skill 'analytics-tagging' tem o checklist completo."
fi
exit 0
EOF
chmod +x "$HOOK"
echo "Hook pre-commit instalado em $HOOK"
