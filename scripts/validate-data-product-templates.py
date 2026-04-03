#!/usr/bin/env python3
"""
Guardrails for data product templates: JSON parse, required odps_document, workflow_id,
and minimal ODPS shape (product.details with at least one locale and name).
Run from repo root: python3 scripts/validate-data-product-templates.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def extract_entity(data: object, rel: str) -> dict | None:
    if not isinstance(data, dict):
        return None
    if data.get("template_type") == "data_product" and isinstance(data.get("entity"), dict):
        return data["entity"]
    if "data_product_id" in data:
        return data
    return None


def check_odps(odps: object, rel: str) -> list[str]:
    errs: list[str] = []
    if not isinstance(odps, dict):
        return [f"{rel}: odps_document must be an object"]
    prod = odps.get("product")
    if not isinstance(prod, dict):
        return [f"{rel}: odps_document.product must be an object"]
    details = prod.get("details")
    if not isinstance(details, dict) or len(details) < 1:
        return [f"{rel}: odps_document.product.details must have at least one locale"]
    for loc, block in details.items():
        if not isinstance(block, dict):
            errs.append(f"{rel}: odps_document.product.details[{loc!r}] must be an object")
            continue
        name = block.get("name")
        if not isinstance(name, str) or not name.strip():
            errs.append(f"{rel}: odps_document.product.details[{loc!r}].name is required")
    return errs


def main() -> int:
    paths = sorted(
        set(ROOT.glob("templates/**/data-products/**/*.json"))
        | set((ROOT / "templates/data-products").glob("*.json"))
    )
    errors: list[str] = []

    for path in paths:
        rel = str(path.relative_to(ROOT))
        try:
            raw = path.read_text(encoding="utf-8")
            data = json.loads(raw)
        except json.JSONDecodeError as e:
            errors.append(f"{rel}: invalid JSON ({e})")
            continue

        entity = extract_entity(data, rel)
        if entity is None:
            continue

        if "odps_document" not in entity:
            errors.append(f"{rel}: missing odps_document on data product entity")
            continue

        if "pipeline_id" in entity:
            errors.append(f"{rel}: illegal pipeline_id at entity root (use workflow_id)")

        if not entity.get("workflow_id"):
            errors.append(f"{rel}: missing workflow_id (Studio entity requires workflow graph link)")

        errors.extend(check_odps(entity.get("odps_document"), rel))

    if errors:
        print("Data product template validation failed:\n", file=sys.stderr)
        for line in errors:
            print(f"  - {line}", file=sys.stderr)
        return 1

    print(f"OK: {len(paths)} template file(s) checked.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
