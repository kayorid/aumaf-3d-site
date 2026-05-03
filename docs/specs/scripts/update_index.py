#!/usr/bin/env python3
"""update_index.py — regenera INDEX.md a partir do estado em disco.

Lê <SPECS_ROOT>/_active/* e <SPECS_ROOT>/_completed/*, extrai metadados
mínimos de cada spec (slug, fase, próximo passo) e regenera INDEX.md.

Uso:
    python3 scripts/update_index.py [<specs-root>]
    SPECS_ROOT=docs/specs python3 scripts/update_index.py

Default: docs/specs. Idempotente — pode rodar muitas vezes.
"""

from __future__ import annotations

import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


def parse_status(status_path: Path) -> dict[str, str]:
    """Extrai campos chave de status.md."""
    if not status_path.exists():
        return {}
    text = status_path.read_text(encoding="utf-8")
    out: dict[str, str] = {}
    phase = re.search(r"\*\*Fase atual\*\*:\s*([^\n]+)", text)
    if phase:
        out["phase"] = phase.group(1).strip()
    next_step = re.search(r"\*\*Próximo passo concreto\*\*:\s*([^\n]+)", text)
    if next_step:
        out["next_step"] = next_step.group(1).strip()
    last_update = re.search(r"\*\*Última atualização\*\*:\s*([^\n]+)", text)
    if last_update:
        out["last_update"] = last_update.group(1).strip()
    return out


def parse_slug_date(dirname: str) -> tuple[str, str]:
    """De '2026-05-10-csv-export' tira ('2026-05-10', 'csv-export')."""
    match = re.match(r"^(\d{4}-\d{2}-\d{2})-(.+)$", dirname)
    if match:
        return match.group(1), match.group(2)
    return "", dirname


def collect(specs_root: Path) -> tuple[list[dict], list[dict]]:
    active: list[dict] = []
    completed: list[dict] = []

    active_root = specs_root / "_active"
    if active_root.is_dir():
        for d in sorted(active_root.iterdir()):
            if d.is_dir():
                date, slug = parse_slug_date(d.name)
                meta = parse_status(d / "status.md")
                active.append(
                    {
                        "name": slug,
                        "date": date,
                        "phase": meta.get("phase", "?"),
                        "next_step": meta.get("next_step", ""),
                        "path": f"_active/{d.name}/",
                    }
                )

    completed_root = specs_root / "_completed"
    if completed_root.is_dir():
        for d in sorted(completed_root.iterdir(), reverse=True):
            if d.is_dir():
                date, slug = parse_slug_date(d.name)
                completed.append(
                    {
                        "name": slug,
                        "date": date,
                        "path": f"_completed/{d.name}/",
                    }
                )

    return active, completed


def render_index(specs_root: Path, active: list[dict], completed: list[dict]) -> str:
    now_iso = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M")
    lines: list[str] = []
    lines.append("# Specs Index")
    lines.append("")
    lines.append("> Visão de portfólio das specs deste projeto. Regenerado por `scripts/update_index.py`.")
    lines.append("")
    lines.append(f"**Última atualização**: {now_iso}")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Em andamento")
    lines.append("")
    if active:
        lines.append("| Feature | Fase | Início | Próximo passo | Link |")
        lines.append("|---------|------|--------|---------------|------|")
        for s in active:
            lines.append(
                f"| {s['name']} | {s['phase']} | {s['date']} | {s['next_step']} | [pasta]({s['path']}) |"
            )
    else:
        lines.append("_(nenhuma spec ativa)_")
    lines.append("")
    lines.append("## Recém concluídas")
    lines.append("")
    if completed:
        lines.append("| Feature | Concluída em | Retrospectiva |")
        lines.append("|---------|--------------|---------------|")
        for s in completed[:20]:
            retro_path = f"{s['path']}retrospective.md"
            lines.append(f"| {s['name']} | {s['date']} | [retro]({retro_path}) |")
        if len(completed) > 20:
            lines.append("")
            lines.append(f"_(+ {len(completed) - 20} specs anteriores em `_completed/`)_")
    else:
        lines.append("_(nenhuma spec concluída ainda)_")
    lines.append("")
    lines.append("## Constituição")
    lines.append("")
    if (specs_root / "constitution.md").exists():
        lines.append("[constitution.md](constitution.md)")
    else:
        lines.append("_(constitution.md ainda não criada — copie de templates/)_")
    lines.append("")
    return "\n".join(lines)


def main(argv: list[str]) -> int:
    specs_root = Path(argv[1]) if len(argv) > 1 else Path(os.environ.get("SPECS_ROOT", "docs/specs"))
    specs_root = specs_root.resolve()
    if not specs_root.exists():
        print(f"erro: {specs_root} não existe", file=sys.stderr)
        return 2

    active, completed = collect(specs_root)
    content = render_index(specs_root, active, completed)
    out = specs_root / "INDEX.md"
    out.write_text(content, encoding="utf-8")
    print(f"✅ {out} atualizado — {len(active)} ativa(s), {len(completed)} concluída(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
