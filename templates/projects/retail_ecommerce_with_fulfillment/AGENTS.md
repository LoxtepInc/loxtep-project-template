# AGENTS.md — Ecommerce with Fulfillment Dashboard

> Agent-ready context for this Loxtep project. This file is scaffolded by
> `loxtep init --template retail_ecommerce_with_fulfillment`. It tells an AI coding agent (Claude Code,
> Cursor, Copilot, etc.) how to operate on this project through the Loxtep
> SDK, CLI, and hosted MCP server, and which resources the default Skill
> permits.

## What this project is

Demonstrates the source to consumer data product model. Ingests raw order events (source DP), then projects orders + inventory + shipments into a fulfillment dashboard (consumer DP).

This project was scaffolded from the **retail_ecommerce_with_fulfillment** template. It defines
7 resources across data
products, connectors/connections, and workflows (listed under
[Workspace resources](#workspace-resources)).

## Workspace layout

```
.loxtep/
  project.json            # project config (id, instance binding, repository)
  skills/retail-ecommerce-with-fulfillment-default.yaml  # default scoped Skill (see "Skill scope" below)
  generated/index.ts      # typed constants from loxtep generate (after attach)
domains/                  # domain definitions
connectors/               # connector/connection definitions
workflows/                # code-first Data_Workflow_Modules (*.ts)
data-products/            # data product definitions
```

## CLI lifecycle

| Command | Purpose |
| --- | --- |
| `loxtep login` | Authenticate the CLI/SDK against the platform. |
| `loxtep attach [--instance <id>]` | Link this project to a Loxtep Instance; writes `instance_id` + `api_url` (and the bound `repository` block) into `.loxtep/project.json`. |
| `loxtep generate` | Compile connected resources into typed constants at `.loxtep/generated/index.ts` and validate every `.loxtep/skills/*.yaml` against the Workspace Context. |
| `loxtep test <module> --event <file>` | Run one workflow module locally against the attached instance; guarded operations prompt for approval. |
| `loxtep deploy` | Compile + deploy workflow modules through the platform deploy pipeline. |
| `loxtep activity list` | Read the unified action-trace + audit history. |
| `loxtep improvements list|apply|reject` | Review and adopt AI-Eval-derived workflow improvements. |

> After scaffolding, run `loxtep login`, then `loxtep attach`, then
> `loxtep generate` to produce typed constants for this workspace.

## SDK methods

- `LoxtepClient.fromWorkspace()` — construct a client from `.loxtep/project.json` (resolves `api_url`/`project_id`/`instance_id` + credentials).
- `defineDataWorkflow({...})` — author a code-first `Data_Workflow_Module` with typed triggers (`on.queueEvent` / `on.connectorEvent` / `on.schedule` / `on.webhook`).
- `toolbox.*` — **deterministic** typed platform calls (no model in the loop); returns typed results or throws.
- `agent({ prompt, skills })` — **agentic** entry point restricted to the union of the supplied skills' scopes; out-of-scope reaches are blocked before any platform call and recorded in the action trace.
- `client.data_products`, `client.connectors`, `client.workflows`, `client.domains`, `client.queues` — typed resource namespaces.

## MCP tools (hosted at `mcp.loxtep.io`)

When this workspace is connected, the hosted MCP server scopes tool calls to
this project's `project_id` + `instance_id` and exposes a
`loxtep_workspace_context` resource projecting the project's data products,
connectors, domains, queues, flows, and workflows (plus the bound repository
when set). Tool calls that carry a skill name are checked against that skill's
scope **before** execution; an out-of-scope resource is rejected with
`SCOPE_VIOLATION` and a denied operation is rejected without mutating any
resource (fail-closed).

## Skill scope

The default Skill for this template is
`.loxtep/skills/retail-ecommerce-with-fulfillment-default.yaml`. It grants **read-only** access scoped to
**only** the resources this template defines. Anything not listed there is
denied by default.

```yaml
name: retail-ecommerce-with-fulfillment-default
scope:        # permitted resource identifiers, per type
  data_products: ["fulfillment-dashboard","orders-source","orders-upstream"]
  connectors: ["fulfillment-consumption","orders-webhook"]
  workflows: ["fulfillment-projection","orders-ingestion"]
  domains: []
  queues: []
permissions:  # allowed operations per type (read|write|create|delete); unlisted ⇒ denied
  data_products: [read]
  connectors: [read]
  workflows: [read]
```

To let an agent **create or modify** resources, add the operation to the
matching `permissions` entry (for example `workflows: [read, write]`) or add
a new identifier under `scope`. Then run `loxtep generate` to re-validate the
skill against the Workspace Context.

## Workspace resources

These are the resources defined by the **retail_ecommerce_with_fulfillment** template (referenced by
their template slugs until `loxtep generate` resolves them to platform ids):

- **Data products:**
  - `fulfillment-dashboard`
  - `orders-source`
  - `orders-upstream`
- **Connectors / connections:**
  - `fulfillment-consumption`
  - `orders-webhook`
- **Workflows:**
  - `fulfillment-projection`
  - `orders-ingestion`

## Conventions for agents

- Prefer `toolbox` (deterministic) calls for predictable work; use `agent()` only for reasoning/classification, always with an explicit `skills` allowlist.
- Never widen a skill's scope or permissions silently — surface the change to the developer.
- Reference resources by their generated typed constants (after `loxtep generate`) rather than hardcoding ids.
- Treat `.loxtep/skills/*.yaml` as the source of truth for what this project's agents may reach.
