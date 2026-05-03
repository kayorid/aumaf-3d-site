#!/usr/bin/env python3
"""validate_spec.py — checagem mecânica de completude de uma spec.

Uso:
    python3 scripts/validate_spec.py <path-to-spec-dir>

Não falha com exit code: o relatório é orientativo. Use-o como sinal antes
de avançar de fase. Decisões de "está pronto?" continuam humanas.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Iterable


REQUIRED_FILES_BY_PHASE = {
    "specify": ["requirements.md"],
    "clarify": ["requirements.md"],
    "plan": ["requirements.md", "design.md"],
    "tasks": ["requirements.md", "design.md", "tasks.md"],
    "implement": ["requirements.md", "design.md", "tasks.md", "status.md"],
    "validate": ["requirements.md", "design.md", "tasks.md", "status.md"],
    "retrospective": [
        "requirements.md",
        "design.md",
        "tasks.md",
        "status.md",
        "retrospective.md",
    ],
}

REQUIREMENTS_SECTIONS = [
    "## 1. Contexto e problema",
    "## 5. Critérios de aceitação",
    "## 7. Fora de escopo",
]

DESIGN_SECTIONS = [
    "## 1. Visão geral",
    "## 5. Mapeamento Requirements → Design",
    "## 7. Boundaries",
]

TASKS_REQUIRED_PATTERNS = [
    (re.compile(r"-\s*\[[ x]\]\s+\*\*T\d+\*\*"), "tasks numeradas com formato [ ] **TN**"),
]


def has_section(text: str, heading: str) -> bool:
    """Aceita match parcial em qualquer linha de heading."""
    needle = heading.lower().strip()
    return any(needle in line.lower() for line in text.splitlines())


def find_orphan_clarify(text: str) -> list[int]:
    """Retorna números de linha com [CLARIFY] não resolvido."""
    return [i + 1 for i, line in enumerate(text.splitlines()) if "[CLARIFY]" in line]


def find_orphan_todo(text: str) -> list[int]:
    """Retorna números de linha com TODO/TBD/FIXME órfãos."""
    pattern = re.compile(r"\b(TODO|TBD|FIXME)\b")
    return [i + 1 for i, line in enumerate(text.splitlines()) if pattern.search(line)]


def detect_phase_from_status(status_text: str) -> str | None:
    match = re.search(r"\*\*Fase atual\*\*:\s*([a-z]+)", status_text, re.IGNORECASE)
    return match.group(1).lower() if match else None


def count_ears_criteria(text: str) -> int:
    """Conta itens R<n> em requirements.md (assume formato `**R1**:`)."""
    return len(re.findall(r"\*\*R\d+\*\*", text))


def check_phase_files(spec_dir: Path, phase: str, report: list[str]) -> None:
    required = REQUIRED_FILES_BY_PHASE.get(phase, [])
    for fname in required:
        if not (spec_dir / fname).exists():
            report.append(f"❌ ausente para fase '{phase}': {fname}")


def check_requirements(spec_dir: Path, report: list[str]) -> None:
    f = spec_dir / "requirements.md"
    if not f.exists():
        return
    text = f.read_text(encoding="utf-8")

    for section in REQUIREMENTS_SECTIONS:
        if not has_section(text, section):
            report.append(f"⚠️  requirements.md sem seção '{section}'")

    n = count_ears_criteria(text)
    if n == 0:
        report.append("❌ requirements.md sem critérios EARS (R1, R2...)")
    else:
        report.append(f"ℹ️  requirements.md tem {n} critério(s) EARS")

    orphan = find_orphan_clarify(text)
    if orphan:
        report.append(
            f"⚠️  requirements.md tem [CLARIFY] não resolvido em {len(orphan)} linha(s): {orphan[:5]}"
        )


def check_design(spec_dir: Path, report: list[str]) -> None:
    f = spec_dir / "design.md"
    if not f.exists():
        return
    text = f.read_text(encoding="utf-8")
    for section in DESIGN_SECTIONS:
        if not has_section(text, section):
            report.append(f"⚠️  design.md sem seção '{section}'")


def check_tasks(spec_dir: Path, report: list[str]) -> None:
    f = spec_dir / "tasks.md"
    if not f.exists():
        return
    text = f.read_text(encoding="utf-8")
    for pattern, descr in TASKS_REQUIRED_PATTERNS:
        if not pattern.search(text):
            report.append(f"⚠️  tasks.md não tem {descr}")
    total = len(re.findall(r"-\s*\[[ x]\]", text))
    done = len(re.findall(r"-\s*\[x\]", text))
    if total:
        report.append(f"ℹ️  tasks.md: {done}/{total} marcadas como concluídas")


def check_general(spec_dir: Path, report: list[str]) -> None:
    for f in spec_dir.glob("*.md"):
        text = f.read_text(encoding="utf-8")
        orphans = find_orphan_todo(text)
        if orphans:
            report.append(
                f"ℹ️  {f.name} contém TODO/TBD/FIXME em {len(orphans)} linha(s): {orphans[:5]}"
            )


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("uso: validate_spec.py <path-to-spec-dir>", file=sys.stderr)
        return 2
    spec_dir = Path(argv[1]).resolve()
    if not spec_dir.is_dir():
        print(f"erro: {spec_dir} não é um diretório", file=sys.stderr)
        return 2

    report: list[str] = []

    status_file = spec_dir / "status.md"
    detected_phase = None
    if status_file.exists():
        detected_phase = detect_phase_from_status(status_file.read_text(encoding="utf-8"))
        if detected_phase:
            report.append(f"ℹ️  fase detectada (de status.md): {detected_phase}")
            check_phase_files(spec_dir, detected_phase, report)
        else:
            report.append("⚠️  status.md sem 'Fase atual:' parseável")

    check_requirements(spec_dir, report)
    check_design(spec_dir, report)
    check_tasks(spec_dir, report)
    check_general(spec_dir, report)

    print(f"\n=== validação spec: {spec_dir.name} ===\n")
    if report:
        for line in report:
            print(line)
    else:
        print("✅ nada a reportar — spec parece consistente")
    print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
