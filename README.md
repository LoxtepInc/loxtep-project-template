# Loxtep Project Template

This repository contains **project demos**, **catalog templates** (workflows, connectors, transforms, projects, etc.), and metadata consumed by the Loxtep platform. JSON uses `template_type` / `template_slug` and lives under the **`templates/`** tree (synced to S3 for the template catalog).

## Structure

```
loxtep-project-template/
├── demos/                      # Full project demos (complete working examples)
│   └── onboarding/             # Getting started demo project
│       ├── .loxtep/           # Project metadata
│       │   └── project.json
│       ├── domains/           # Domain definitions
│       ├── connections/       # Connection configurations
│       ├── workflows/         # Workflow definitions (Studio / flow graph)
│       └── data-products/     # Data product definitions
│
├── templates/                  # Catalog templates (platform-synced)
│   ├── workflows/             # Workflow templates (`{slug}/workflow.json` + optional `connections/`, etc.)
│   ├── connectors/            # Connector templates (`{slug}.json`)
│   ├── transforms/            # Transform templates
│   ├── projects/              # Multi-workflow project templates
│   ├── data-products/         # Data product templates
│   ├── domains/               # Domain templates
│   ├── validations/           # Validation rule templates
│   ├── exports/               # Export templates
│   └── consumption/           # Consumption / activation templates
│
└── manifest.json              # Index of demos and catalog templates
```

## Template types

### Project demos (`demos/`)

Full project trees that can be cloned as a starting point. Each demo is a complete, working project with entity folders configured.

**Usage:** When creating a new project, select a demo to clone the entire structure.

### Catalog templates (`templates/`)

Reusable JSON definitions the platform lists in the **template catalog** and applies via `POST /projects/{project_id}/templates` (`template_type`, `template_slug`). Placeholders are replaced with project-specific IDs when applied.

#### ID placeholders

| Placeholder | Description | Example replacement |
|-------------|-------------|---------------------|
| `{{WORKFLOW_ID}}` | Workflow identifier | `550e8400-e29b-41d4-a716-446655440000` |
| `{{CONNECTION_ID}}` | Connection identifier | `proj-abc-660e8400-e29b-41d4-a716-446655440000` |
| `{{CONNECTOR_ID}}` | Connector identifier | `proj-abc-770e8400-e29b-41d4-a716-446655440000` |
| `{{DATA_PRODUCT_ID}}` | Data product identifier | `proj-abc-880e8400-e29b-41d4-a716-446655440000` |
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
| Data product | `templates/data-products/` | Data product definitions |
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

## Contributing

### Adding a new demo

1. Create a new directory under `demos/` with a descriptive name
2. Add `.loxtep/project.json` with project metadata
3. Add entity files in the appropriate subdirectories
4. Update `manifest.json` under `demos`
5. Run `pnpm lint` to validate structure

### Adding a new catalog template

1. Add JSON under the correct `templates/<category>/` path (see platform `templateCatalogConfig` for layout)
2. Use `template_type` at the top level where applicable; use ID placeholders for entity references
3. Update `manifest.json` under `templates` if the manifest indexes that entry
4. Document any special requirements in this README

## Validation

- **ls-lint:** file naming
- **JSON syntax:** GitHub Actions
- **Structure:** required `templates/` subtrees (see `.github/workflows/validate.yml`)

```bash
pnpm lint
pnpm validate
```

## License

Copyright 2026 Symmatiq. All rights reserved.
