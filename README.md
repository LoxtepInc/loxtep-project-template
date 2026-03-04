# Loxtep Project Template

This repository contains project templates, demo projects, and reusable component blueprints for the Loxtep data mesh platform.

## Structure

```
loxtep-project-template/
├── demos/                      # Full project demos (complete working examples)
│   └── onboarding/            # Getting started demo project
│       ├── .loxtep/           # Project metadata
│       │   └── project.json
│       ├── domains/           # Domain definitions
│       ├── connections/       # Connection configurations
│       ├── pipelines/         # Pipeline definitions
│       └── data-products/     # Data product definitions
│
├── blueprints/                 # Reusable component blueprints
│   ├── pipelines/             # Pipeline component blueprints
│   ├── connectors/            # Connector blueprints
│   ├── connections/           # Connection blueprints
│   ├── transforms/            # Transformation blueprints
│   └── consumption/           # Export/consumption blueprints
│
└── manifest.json              # Index of all demos and blueprints
```

## Blueprint Types

### Project Demos (`demos/`)

Full project templates that can be cloned as a starting point. Each demo is a complete, working project with all entity types configured.

**Usage**: When creating a new project, select a demo template to clone the entire structure.

### Component Blueprints (`blueprints/`)

Individual component templates that can be inserted into existing projects. These use ID placeholders that are replaced with project-specific UUIDs when applied.

#### ID Placeholders

Blueprints use the following placeholder patterns:

| Placeholder | Description | Example Replacement |
|-------------|-------------|---------------------|
| `{{PIPELINE_ID}}` | Pipeline identifier | `proj-abc-550e8400-e29b-41d4-a716-446655440000` |
| `{{CONNECTION_ID}}` | Connection identifier | `proj-abc-660e8400-e29b-41d4-a716-446655440000` |
| `{{CONNECTOR_ID}}` | Connector identifier | `proj-abc-770e8400-e29b-41d4-a716-446655440000` |
| `{{DATA_PRODUCT_ID}}` | Data product identifier | `proj-abc-880e8400-e29b-41d4-a716-446655440000` |
| `{{DOMAIN_ID}}` | Domain identifier | `proj-abc-990e8400-e29b-41d4-a716-446655440000` |
| `{{PROJECT_ID_PREFIX}}` | Project ID prefix for namespacing | `proj-abc` |

**Example blueprint file** (`blueprints/pipelines/webhook-ingestion.json`):

```json
{
  "pipeline_id": "{{PIPELINE_ID}}",
  "name": "Webhook Ingestion",
  "type": "ingestion",
  "connection_id": "{{CONNECTION_ID}}",
  "configuration": {
    "source_type": "webhook",
    "batch_size": 100
  }
}
```

When applied to a project, placeholders are replaced with project-prefixed UUIDs:

```json
{
  "pipeline_id": "proj-abc-550e8400-e29b-41d4-a716-446655440000",
  "name": "Webhook Ingestion",
  "type": "ingestion",
  "connection_id": "proj-abc-660e8400-e29b-41d4-a716-446655440000",
  "configuration": {
    "source_type": "webhook",
    "batch_size": 100
  }
}
```

## File Naming Conventions

All files in this repository follow these conventions:

- **Entity files**: `{kebab-case-name}.json`
- **Directory names**: `kebab-case` (lowercase with hyphens)
- **No spaces** in file or directory names
- **JSON files only** for entity definitions

These conventions are enforced by `ls-lint` on every commit.

## Entity Types

| Entity Type | Directory | Description |
|-------------|-----------|-------------|
| Domain | `domains/` | Business domain definitions |
| Connector | `connectors/` | Connector type definitions |
| Connection | `connections/` | Connection configurations |
| Pipeline | `pipelines/` | Pipeline definitions |
| Transform | `transforms/` | Transformation definitions |
| Data Product | `data-products/` | Data product definitions |
| Export | `exports/` | Export configurations |
| Consumption | `consumption/` | Consumption/subscription blueprints (e.g. event-driven webhook delivery) |

### Event-driven webhook delivery (activation)

The **event-driven-webhook-delivery** consumption blueprint is a composable template for Phase 6 activation: when events are produced for a data product, the platform resolves webhook consumptions (subscriptions) and enqueues delivery to the async webhook delivery pipeline (requested → processor → completed/failed). Add this blueprint to a project to enable event-driven webhook delivery for a data product. It composes with the **consumption-webhook** pipeline blueprint.

## Project Metadata

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

### Adding a New Demo

1. Create a new directory under `demos/` with a descriptive name
2. Add `.loxtep/project.json` with project metadata
3. Add entity files in the appropriate subdirectories
4. Update `manifest.json` to include the new demo
5. Run `pnpm lint` to validate structure

### Adding a New Blueprint

1. Create a JSON file in the appropriate `blueprints/` subdirectory
2. Use ID placeholders for all entity references
3. Update `manifest.json` to include the new blueprint
4. Add documentation in this README if the blueprint has special requirements

## Validation

This repository uses:

- **ls-lint**: Enforces file naming conventions
- **JSON Schema**: Validates entity structure
- **GitHub Actions**: Runs validation on every PR

Run locally:

```bash
# Validate file naming
pnpm lint

# Validate JSON files
pnpm validate
```

## License

Copyright 2026 Symmatiq. All rights reserved.
