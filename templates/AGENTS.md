# AGENTS.md — Loxtep Template Catalog

> Agent-facing discovery guide for the Loxtep template catalog. This file tells
> AI coding agents how to discover, select, and apply templates from this
> repository when operating on Loxtep projects via the hosted MCP server, CLI,
> or SDK.

## What this catalog is

This directory contains **reusable templates** for every entity type in the
Loxtep data mesh platform. Templates are the building blocks agents use to
scaffold projects, add workflows, connect data sources, apply transformations,
and model data products — without constructing JSON from scratch.

## Template categories

| Category | Path | Purpose | When to use |
|----------|------|---------|-------------|
| **Projects** | `projects/` | Full project scaffolds with workflows, connections, and data products | User says "create a project", "start from scratch", "new data mesh" |
| **Workflows** | `workflows/` | Flow definitions (ingestion, enrichment, consumption) | User says "add a workflow", "ingest data", "enrich", "consume", "expose API" |
| **Connectors** | `connectors/` | Connector type packages with actions, schemas, vocabulary | User says "connect Shopify", "add a connector", "sync from Stripe" |
| **Data Products** | `data-products/` | Data product definitions (source or consumer) | User says "create a data product", "model orders", "customer 360" |
| **Transforms** | `transforms/` | Transformation primitives for workflow graphs | User says "filter", "rename fields", "flatten", "deduplicate", "encrypt" |
| **Validations** | `validations/` | Data quality rules for workflow graphs | User says "validate", "require fields", "check schema" |
| **Exports** | `exports/` | Output configurations (S3, webhook) | User says "export to S3", "send to webhook" |
| **Domains** | `domains/` | Business domain definitions | User says "create a domain", "organize by department" |

## How agents discover templates

### Via MCP (recommended)

```json
{ "operation": "list_templates" }
{ "operation": "get_template", "template_id": "<id>" }
{ "operation": "apply_template", "project_id": "<id>", "template_type": "<type>", "template_slug": "<slug>" }
```

### Via manifest.json (offline / pre-flight)

The root `manifest.json` indexes all demos and catalog templates with:
- `slug` — stable identifier for `apply_template`
- `name` — human-readable label
- `description` — what it does (match against user intent)
- `tags` — keyword matching for discovery
- `path` — file path within this repo

## Template selection decision tree

### Workflow selection

```
User wants to ingest data from...
├── External webhook/HTTP POST → webhook-ingestion
├── SaaS connector (Shopify, Stripe, etc.) → connector-ingestion
├── REST API on a schedule → api-polling
├── Database changes (CDC) → database-cdc
├── Files (CSV/JSON/Parquet in S3) → file-import
├── Loxtep SDK (code-first) → sdk-ingest
├── AsyncAPI spec → asyncapi-import
└── Blank / custom → blank

User wants to transform/enrich data...
├── From another data product → data-product-enrichment
├── Generic enrichment with transforms → enrichment-basic
└── Real-time stream processing → streaming-transform

User wants to expose/consume data...
├── Outbound webhook delivery → consumption-webhook
├── REST API for pull access → consumption-api
└── Trigger from data product events/cron → data-product-consumption
```

### Connector selection

```
User wants to connect...
├── E-commerce: shopify, bigcommerce, woocommerce
├── Payments: stripe, paypal
├── CRM/Marketing: hubspot, klaviyo, attentive
├── Fulfillment: shipstation, shipbob, loop-returns
├── Support: gorgias
├── Analytics: northbeam, fairing, triple-whale
├── Databases: postgres, mysql-source
├── Files: s3-source, s3-destination
├── Code/DevOps: github
├── Custom API: rest-api
├── Inbound HTTP events: webhook-catch
├── Outbound HTTP delivery: webhook-destination
├── SDK/Programmatic: sdk
├── Data product trigger: data-product-trigger
└── Other/OAuth: blank
```

### Data product selection

```
User wants to create a data product...
├── Unified customer profile → customer-360
├── Orders/transactions analytics → orders-analytics
├── Custom source (atomic, domain-owned) → blank-source
└── Custom consumer (composed/projected) → blank-consumer
```

### Transform selection

```
User wants to...
├── Filter events by condition → filter
├── Rename fields → rename-field
├── Select specific fields → select-fields
├── Drop fields → drop-fields
├── Flatten nested objects → flatten
├── Explode array to rows → explode-array
├── Parse JSON strings → parse-json
├── Extract from JSON path → extract-json-path
├── Format timestamps → format-timestamp
├── Add current timestamp → add-current-timestamp
├── Derive new columns → derived-columns
├── Concatenate columns → concatenate-columns
├── Change schema structure → change-schema
├── Convert array to columns → array-to-column
├── Capitalize strings → capitalize
├── Remove null events → remove-null-events
├── Drop null fields → drop-null-fields
├── Fill missing values → fill-missing-values
├── Drop duplicates → drop-duplicates
├── Assign unique IDs → assign-identifier
├── Encrypt/decrypt fields → crypto
├── Detect PII/sensitive data → detect-sensitive-data
├── Evaluate data quality → evaluate-data-quality
├── Extract via regex → regex-extractor
├── Format with template → formatter
├── Convert XML to JSON → xml-to-json
├── Split events → split
├── Batch events → batch
├── Add delay → delay
└── Run custom code → execute-code-function
```

## Vocabulary and semantic mappings

Connectors with a `vocabulary/` directory include:
- **Semantic field mappings** — maps connector fields to schema.org URIs
- **Transformation templates** — pre-built transform chains for canonical output
- **Validation rules** — data quality constraints per entity
- **Entity relationships** — graph edges between entity types

Connectors with vocabulary: `shopify`, `bigcommerce`, `gorgias`, `hubspot`,
`klaviyo`, `paypal`, `shipstation`, `stripe`, `woocommerce`, `netsuite`.

Use vocabulary data to:
1. Auto-suggest transforms when building enrichment workflows
2. Map fields to the organization's ontology
3. Propose data quality rules for new data products
4. Build entity relationship graphs

## Applying templates via MCP

### Apply a project template (scaffolds entire project)

```json
{
  "operation": "apply_template",
  "project_id": "<project_id>",
  "template_type": "project",
  "template_slug": "retail_ecommerce"
}
```

### Apply a workflow template

```json
{
  "operation": "apply_template",
  "project_id": "<project_id>",
  "template_type": "workflow",
  "template_slug": "webhook-ingestion"
}
```

### Apply a data product template

```json
{
  "operation": "apply_template",
  "project_id": "<project_id>",
  "template_type": "data_product",
  "template_slug": "customer-360"
}
```

### Apply a transform template (within a workflow)

```json
{
  "operation": "create_transformation",
  "project_id": "<project_id>",
  "workflow_id": "<workflow_id>",
  "transformation": {
    "name": "Filter active orders",
    "transform_type": "filter",
    "operation_config": { "condition": "status === \"active\"" }
  }
}
```

## Conventions for agents

- **Match user intent to tags first** — every template has a `tags` array for keyword matching.
- **Check `use_cases` for disambiguation** — when multiple templates match, compare `use_cases` to user intent.
- **Check `produces_kind`** — workflow templates declare whether they produce `source` or `consumer` data products.
- **Check `dependencies`** — workflow templates declare required connections/transformations.
- **Use vocabulary for field mapping** — when building transforms for a known connector, reference its vocabulary for canonical field names.
- **Prefer specific templates over blank** — only use blank templates when no specific template matches the use case.
- **Combine templates** — a typical project uses multiple templates: a project template + workflow templates + transform templates + data product templates.

## Template composition patterns

### Pattern 1: SaaS connector → data product (most common)

1. Apply connector template (e.g., `shopify`)
2. Apply `connector-ingestion` workflow template
3. Apply `blank-source` data product template (auto-created by connector ingestion)

### Pattern 2: Enrichment pipeline

1. Source data product exists (from Pattern 1)
2. Apply `data-product-enrichment` workflow template
3. Add transform templates (filter → rename → select)
4. Apply consumer data product template (e.g., `orders-analytics`)

### Pattern 3: Event-driven consumption

1. Data product exists
2. Apply `consumption-webhook` workflow template
3. Configure target endpoint

### Pattern 4: SDK-first ingestion

1. Apply `sdk-ingest` workflow template
2. Apply `blank-source` data product template
3. Deploy → write events via `@loxtep/sdk`

## Related skills

| Skill | Covers |
|-------|--------|
| `data-workflows` | Creating/operating workflows, connections, data products, deployments |
| `create-connector` | Setting up SaaS connectors with OAuth |
| `data-product-modeling` | Designing source/consumer data product schemas |
| `loxtep-sdk` | Writing/reading events programmatically |
| `loxtep-instances` | Provisioning runtime instances for deployment |
