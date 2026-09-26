# Connector contract tests

Readiness **W10.2** (P1-8): contract coverage for the site-named connectors
Shopify, Stripe, Zendesk, ShipStation, and Salesforce.

## What is covered

For each of the five connectors:

1. **Action `input_schema`** — every `connector_package.actions[]` definition has a
   well-formed object schema (`type`, `properties`, optional `required`).
2. **Sample fetch fixtures** — one fixture per `sync_plan` entity under
   `fixtures/<slug>/`, including:
   - `input` validated against the fetch action’s `input_schema`
   - `response` extracted via `records_path` (empty path = bare array root)
   - each sample record validated against `entity_catalog.*.record_schema_path`
3. **Trigger alignment** — `trigger_config_spec.fields.sync_entity.enum` matches
   `sync_plan.entities` keys (W10.1).

## Run

```bash
pnpm test:connectors
# or
node --test tests/connectors/*.test.mjs
```

Also runs as part of `pnpm validate` and the `connector-contract-tests` CI job.
