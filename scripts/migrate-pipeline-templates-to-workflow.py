#!/usr/bin/env python3
"""One-off style migrator: templates/workflows/**/*.json pipeline → workflow terminology."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WF_DIR = ROOT / "templates" / "workflows"


def migrate_text(s: str) -> str:
    s = s.replace("https://loxtep.com/schemas/template/pipeline.json",
                  "https://loxtep.com/schemas/template/workflow.json")
    s = s.replace('"template_type": "pipeline"', '"template_type": "workflow"')
    s = s.replace('"pipeline_id"', '"workflow_id"')
    s = s.replace("{{PIPELINE_ID}}", "{{WORKFLOW_ID}}")
    s = s.replace("{{PIPELINE_NAME}}", "{{WORKFLOW_NAME}}")
    s = s.replace("{{PIPELINE_DESCRIPTION}}", "{{WORKFLOW_DESCRIPTION}}")
    s = s.replace('"pipeline_type"', '"workflow_type"')
    s = s.replace('"pipeline_type":', '"workflow_type":')  # metadata keys
    return s


def fix_workflow_entity(obj: dict) -> None:
    """Ensure workflow template entity matches workflow entity conventions."""
    if obj.get("template_type") == "pipeline":
        obj["template_type"] = "workflow"
    if "entity" not in obj or not isinstance(obj["entity"], dict):
        return
    e = obj["entity"]
    if "connection_id" in e:
        del e["connection_id"]
    if "workflow_type" not in e and "pipeline_type" not in e:
        # Default ingestion for templates that had no type key
        e["workflow_type"] = "ingestion"
    if "domain_id" not in e:
        e["domain_id"] = "{{DOMAIN_ID}}"
    ph = obj.get("placeholders")
    if isinstance(ph, dict):
        new_ph = {}
        for k, v in ph.items():
            nk = migrate_text(k)
            nv = migrate_text(str(v)) if isinstance(v, str) else v
            new_ph[nk] = nv
        obj["placeholders"] = new_ph


def process_file(path: Path) -> None:
    raw = path.read_text(encoding="utf-8")
    migrated = migrate_text(raw)
    try:
        data = json.loads(migrated)
    except json.JSONDecodeError as err:
        print(f"SKIP invalid JSON {path}: {err}", file=sys.stderr)
        return
    if path.name == "workflow.json" and isinstance(data, dict):
        fix_workflow_entity(data)
        path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    else:
        path.write_text(migrated, encoding="utf-8")


def main() -> None:
    if not WF_DIR.is_dir():
        print(f"Missing {WF_DIR}", file=sys.stderr)
        sys.exit(1)
    for p in sorted(WF_DIR.rglob("*.json")):
        process_file(p)
    print(f"Migrated JSON under {WF_DIR}")


if __name__ == "__main__":
    main()
