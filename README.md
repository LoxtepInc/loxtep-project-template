# Loxtep Project Template

This repository contains **project demos**, **catalog templates** (workflows, connectors, transforms, projects, etc.), and metadata consumed by the Loxtep platform. JSON uses `template_type` / `template_slug` and lives under the **`templates/`** tree (synced to S3 for the template catalog).

## Structure

```
loxtep-project-template/
├── templates/                  # Catalog templates (platform-synced)
│   ├── projects/              # Project starters (`{slug}/project.json` + `workflows/`, etc.)
│   │   └── retail_ecommerce/  # Minimal starter reachable via `loxtep init` (see below)
│   ├── workflows/             # Workflow templates (`{slug}/workflow.json` + optional `connections/`, etc.)
│   ├── connectors/            # Connector templates (`{slug}.json`)
│   ├── transforms/            # Transform templates
│   ├── data-products/         # Data product templates
│   ├── domains/               # Domain templates
│   ├── validations/           # Validation rule templates
│   ├── exports/               # Export templates
│   └── consumption/           # Consumption / activation templates
│
└── manifest.json              # Index of project starters (`demos[]`) and catalog templates
```

> **Note:** Project starters live under `templates/projects/<slug>/`. The
> `manifest.json` key that indexes them is historically named `demos[]`; there
> is no separate top-level `demos/` directory.

## Template types

### Project starters (`templates/projects/`)

Full project trees that can be cloned as a starting point. Each starter is a complete, working project with entity folders configured, indexed in `manifest.json` under the `demos[]` key.

**Usage:** `loxtep init --template <slug>` materializes a starter into a new project. The **`retail_ecommerce`** starter is the recommended minimal entry — it deploys without editing.

### Catalog templates (`templates/`)

Reusable JSON definitions the platform lists in the **template catalog** and applies via `POST /projects/{project_id}/templates` (`template_type`, `template_slug`). Placeholders are replaced with project-specific IDs when applied.

#### ODPS (Open Data Products Standard v4.1)

Catalog and workflow data product JSON under this repo includes an **`odps_document`** field: the canonical `{ "product": { ... } }` shape from [ODPS v4.1](https://opendataproducts.org/v4.1/schema/odps.json). Platform-specific fields (organization, domain, project, workflow, medallion, storage, ingestion) live under `product.custom.loxtep`, as described in the Loxtep spec at `.kiro/specs/odps-data-product-standard` (in the main `loxtep` repo). Public JSON Schema for Studio/workspace entities: `https://loxtep.io/schemas/entity/odps-product.json` (marketing site).

#### ID placeholders

| Placeholder | Description | Example replacement |
|-------------|-------------|---------------------|
| `{{WORKFLOW_ID}}` | Workflow identifier | `550e8400-e29b-41d4-a716-446655440000` |
| `{{CONNECTION_ID}}` | Connection identifier | `proj-abc-660e8400-e29b-41d4-a716-446655440000` |
| `{{CONNECTOR_ID}}` | Connector identifier | `proj-abc-770e8400-e29b-41d4-a716-446655440000` |
| `{{DATA_PRODUCT_ID}}` | Data product identifier | `proj-abc-880e8400-e29b-41d4-a716-446655440000` |
| `{{OWNER_USER_ID}}` | Owner user UUID (legacy `owner.user_id` and ODPS `dataHolder.dataProductOwner`) | User applying the template |
| `{{DOMAIN_ID}}` | Domain identifier | `proj-abc-990e8400-e29b-41d4-a716-446655440000` |
| `{{PROJECT_ID_PREFIX}}` | Project ID prefix for namespacing | `proj-abc` |

**Example:** a workflow template lives at `templates/workflows/webhook-ingestion/workflow.json` (see that file for the full `template_type` / `entity` shape).

## File naming conventions

- **Entity files:** `{kebab-case-name}.json`
- **Directory names:** `kebab-case` (lowercase with hyphens)
- **No spaces** in file or directory names
- **JSON** for catalog entity definitions

These conventions are enforced by `ls-lint` on every commit.

## Entity types (under `templates/`)

| Entity type | Directory | Description |
|-------------|-----------|-------------|
| Domain | `templates/domains/` | Business domain definitions |
| Connector | `templates/connectors/` | Connector type definitions |
| Connection | *(under a workflow template folder)* | Connection JSON alongside `workflow.json` |
| Workflow | `templates/workflows/` | Workflow definitions |
| Transform | `templates/transforms/` | Transformation definitions |
| Data product | `templates/data-products/` | Data product definitions (include `odps_document` — ODPS v4.1; see below) |
| Export | `templates/exports/` | Export configurations |
| Consumption | `templates/consumption/` | Consumption / activation templates (e.g. event-driven webhook delivery) |

### Event-driven webhook delivery (activation)

The **event-driven-webhook-delivery** consumption template is composable activation: when events are produced for a data product, the platform resolves webhook consumptions and enqueues delivery. It composes with the **consumption-webhook** workflow template.

## Project metadata

Each project/demo includes a `.loxtep/project.json` file:

```json
{
  "project_id": "{{PROJECT_ID}}",
  "name": "Project Name",
  "description": "Project description",
  "version": "1.0.0",
  "template_slug": "onboarding",
  "created_at": "2026-01-28T00:00:00Z"
}
```

## Agent scaffolding (`AGENTS.md` + default skill)

Every project template under `templates/projects/<slug>/` ships agent-ready
scaffolding that `loxtep init --template <slug>` materializes into the project
root:

| File | Purpose |
|------|---------|
| `AGENTS.md` | Per-template agent instructions describing the MCP tools, SDK methods, and the default Skill for that template type. Materialized at the scaffolded project root (R16.1). |
| `.loxtep/skills/<slug>-default.yaml` | Default **Skill** scoped to **only** the resources the template defines (R16.2). Read-only by default; conforms to `schemas/skill-package-v1.schema.json`. |
| `manifest.json` → `demos[].scaffold` | Scaffolding metadata `init --template` reads: the `AGENTS.md` path, the default skill name + path, and the scoped resource identifiers. |

A Skill declares an **access scope** (permitted resource types + identifiers)
and a **`permissions`** map (allowed operations per resource type, drawn from
`read`/`write`/`create`/`delete`). Anything not listed is **denied
(fail-closed)** — see the Loxtep `ai-first-platform-surface` spec (R5).

```yaml
# .loxtep/skills/<slug>-default.yaml
name: <slug>-default
scope:                 # permitted identifiers, per resource type
  data_products: ["raw-orders-sink"]
  connectors: ["orders-webhook"]
  workflows: ["orders-ingestion"]
  domains: []
  queues: []
permissions:           # allowed ops per type; unlisted ⇒ denied
  data_products: [read]
  connectors: [read]
  workflows: [read]
```

These files are **generated** from each template's own resources — do not edit
them by hand. Regenerate after adding/removing resources in a template:

```bash
node scripts/generate-template-agents.mjs          # write/refresh
node scripts/generate-template-agents.mjs --check   # CI: fail on drift
```

## Contributing

### Adding a new project starter

1. Create a new directory under `templates/projects/<slug>/` with a descriptive slug
2. Add `.loxtep/project.json` (or `project.json`) with project metadata
3. Add entity files in the appropriate subdirectories (`workflows/`, `data-products/`, etc.)
4. Update `manifest.json` under `demos[]`
5. Run `pnpm lint` and `pnpm validate` to validate structure

### Adding a new catalog template

1. Add JSON under the correct `templates/<category>/` path (see platform `templateCatalogConfig` for layout)
2. Use `template_type` at the top level where applicable; use ID placeholders for entity references
3. Update `manifest.json` under `templates` if the manifest indexes that entry
4. Document any special requirements in this README

### Adding a new project template

1. Create `templates/projects/<slug>/project.json` plus the `workflows/` tree
2. Add a `demos[]` entry to `manifest.json` with `slug`, `name`, `description`, `path`, and `entities`
3. Run `node scripts/generate-template-agents.mjs` to generate the template's `AGENTS.md`, default scoped skill (`.loxtep/skills/<slug>-default.yaml`), and `demos[].scaffold` metadata
4. Run `pnpm lint` and `pnpm validate`

## Validation

- **ls-lint:** file naming
- **JSON syntax:** GitHub Actions
- **Structure:** required `templates/` subtrees (see `.github/workflows/validate.yml`)

```bash
pnpm lint
pnpm validate
```

## License

Copyright 2026 Loxtep Inc. All rights reserved.
