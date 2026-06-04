#!/usr/bin/env node
/**
 * Generate per-template AGENTS.md + default scoped skill + scaffolding metadata.
 *
 * Spec: ai-first-platform-surface — Task 17.1 (Requirements 16.1, 16.2; R5.1, R5.2)
 *
 * For each project template under `templates/projects/<slug>/` this script
 * derives, from the template's own resources (workflows, connections,
 * data products):
 *
 *   1. `AGENTS.md` — agent-facing instructions describing the MCP tools, SDK
 *      methods, and the template's default Skill (R16.1). Materialized into the
 *      scaffolded project root by `loxtep init --template <slug>`.
 *
 *   2. `.loxtep/skills/<slug>.yaml` — a default Skill scoped to ONLY the
 *      resources defined in the template (R16.2). Scope = permitted resource
 *      types + identifiers; permissions = allowed operations per resource type.
 *      Read-only by default (fail-closed: any type/op not listed is denied) per
 *      the `.loxtep/skills/<name>.yaml` schema (R5.1, R5.2).
 *
 *   3. `scaffold` metadata on the matching `manifest.json` demos[] entry —
 *      records the AGENTS.md path, default skill name + path, and the scoped
 *      resource identifiers used by `init --template` scaffolding.
 *
 * The script also writes `schemas/skill-package-v1.schema.json` (the schema the
 * generated skill YAML conforms to) if it is missing or out of date.
 *
 * Usage:
 *   node scripts/generate-template-agents.mjs           # write/refresh files
 *   node scripts/generate-template-agents.mjs --check    # CI: fail if drift
 *
 * Idempotent: running twice produces byte-identical output.
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
  mkdirSync,
} from 'fs';
import { join, resolve, relative } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const PROJECTS_DIR = join(ROOT, 'templates', 'projects');
const SCHEMAS_DIR = join(ROOT, 'schemas');
const MANIFEST_PATH = join(ROOT, 'manifest.json');

const CHECK = process.argv.includes('--check');

// Resource types recognized by the skill scope schema (R5.1).
const RESOURCE_TYPES = ['data_products', 'connectors', 'workflows', 'domains', 'queues'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const drift = [];

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Write a file, or in --check mode record drift instead of writing.
 * Returns true when the on-disk content already matches.
 */
function writeOrCheck(path, content) {
  const exists = existsSync(path);
  const current = exists ? readFileSync(path, 'utf8') : null;
  if (current === content) return true;
  if (CHECK) {
    drift.push(relative(ROOT, path) + (exists ? ' (out of date)' : ' (missing)'));
    return false;
  }
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, content, 'utf8');
  console.log(`  ${exists ? 'updated' : 'created'}  ${relative(ROOT, path)}`);
  return false;
}

function walk(dir, pattern) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, pattern));
    else if (entry.isFile() && pattern.test(entry.name)) out.push(full);
  }
  return out;
}

/** Stable, de-duplicated, sorted identifier list. */
function sortedUnique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

// ---------------------------------------------------------------------------
// Skill schema (the contract the generated YAML conforms to)
// ---------------------------------------------------------------------------

const SKILL_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://loxtep.io/schemas/skill-package-v1.json',
  title: 'Loxtep skill definition (v1)',
  description:
    'Schema for a scoped Skill definition stored at .loxtep/skills/<skill-name>.yaml. A Skill declares which platform resources (by type and identifier) an AI agent may reach within a workspace, and which operations are permitted per resource type. Any resource type or operation not explicitly listed is DENIED (fail-closed).',
  type: 'object',
  required: ['name', 'scope', 'permissions'],
  properties: {
    name: {
      type: 'string',
      pattern: '^[a-z0-9-_]+$',
      description: 'Unique skill name within the workspace.',
    },
    description: { type: 'string', description: 'Human-readable summary of what the skill grants.' },
    scope: {
      type: 'object',
      description:
        'Permitted resource identifiers per resource type. An identifier not listed under its type is out of scope (fail-closed).',
      additionalProperties: false,
      properties: {
        data_products: { $ref: '#/$defs/identifierList' },
        connectors: { $ref: '#/$defs/identifierList' },
        workflows: { $ref: '#/$defs/identifierList' },
        domains: { $ref: '#/$defs/identifierList' },
        queues: { $ref: '#/$defs/identifierList' },
      },
    },
    permissions: {
      type: 'object',
      description:
        'Allowed operations per resource type, drawn from {read, write, create, delete}. A resource type or operation not listed is DENIED (fail-closed).',
      additionalProperties: false,
      properties: {
        data_products: { $ref: '#/$defs/operationList' },
        connectors: { $ref: '#/$defs/operationList' },
        workflows: { $ref: '#/$defs/operationList' },
        domains: { $ref: '#/$defs/operationList' },
        queues: { $ref: '#/$defs/operationList' },
      },
    },
  },
  additionalProperties: false,
  $defs: {
    identifierList: { type: 'array', items: { type: 'string' }, uniqueItems: true },
    operationList: {
      type: 'array',
      items: { type: 'string', enum: ['read', 'write', 'create', 'delete'] },
      uniqueItems: true,
    },
  },
};

// ---------------------------------------------------------------------------
// Per-template resource extraction
// ---------------------------------------------------------------------------

/**
 * Collect the resource identifiers a project template defines, grouped by the
 * skill scope's resource types. Identifiers use template slugs, which are the
 * stable names a developer references before `loxtep generate` resolves them.
 */
function collectTemplateResources(projectDir) {
  const workflowsDir = join(projectDir, 'workflows');
  const data_products = [];
  const connectors = [];
  const workflows = [];

  for (const file of walk(workflowsDir, /\.json$/)) {
    let json;
    try {
      json = readJson(file);
    } catch {
      continue;
    }
    switch (json.template_type) {
      case 'workflow':
      case 'asyncapi':
        if (json.slug) workflows.push(json.slug);
        break;
      case 'trigger':
        // A connection's key is the stable connector/trigger identifier.
        if (json.entity && json.entity.key) connectors.push(json.entity.key);
        else if (json.slug) connectors.push(json.slug);
        break;
      case 'data_product':
        if (json.slug) data_products.push(json.slug);
        break;
      default:
        break;
    }
  }

  return {
    data_products: sortedUnique(data_products),
    connectors: sortedUnique(connectors),
    workflows: sortedUnique(workflows),
    domains: [],
    queues: [],
  };
}

// ---------------------------------------------------------------------------
// Skill YAML emission (matches schemas/skill-package-v1.schema.json)
// ---------------------------------------------------------------------------

function yamlList(items) {
  if (items.length === 0) return '[]';
  return JSON.stringify(items);
}

/**
 * Build the default, read-only Skill scoped to the template's resources.
 * Empty resource types are still listed (as []) so the scope is explicit and
 * the fail-closed boundary is obvious to a reader.
 */
function emitSkillYaml(skillName, projectName, resources) {
  const presentTypes = RESOURCE_TYPES.filter((t) => resources[t] && resources[t].length > 0);
  const lines = [];
  lines.push(`# .loxtep/skills/${skillName}.yaml`);
  lines.push(`# Default skill for the "${projectName}" template.`);
  lines.push('# Conforms to https://loxtep.io/schemas/skill-package-v1.json');
  lines.push('# Scoped to ONLY this template\'s resources; read-only by default.');
  lines.push('# Any resource type or operation not listed below is DENIED (fail-closed).');
  lines.push(`name: ${skillName}`);
  lines.push(`description: Read-only access scoped to the ${projectName} template resources`);
  lines.push('scope:');
  for (const t of RESOURCE_TYPES) {
    lines.push(`  ${t}: ${yamlList(resources[t] || [])}`);
  }
  lines.push('permissions:');
  if (presentTypes.length === 0) {
    // Blank template: no resources yet. Grant read on data_products/workflows
    // so the agent can list as resources are added, but nothing destructive.
    lines.push('  data_products: [read]');
    lines.push('  workflows: [read]');
  } else {
    for (const t of presentTypes) {
      lines.push(`  ${t}: [read]`);
    }
  }
  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// AGENTS.md emission
// ---------------------------------------------------------------------------

function bullets(items) {
  if (!items || items.length === 0) return '  - _(none defined yet — add resources, then run `loxtep generate`)_';
  return items.map((i) => `  - \`${i}\``).join('\n');
}

function emitAgentsMd(meta) {
  const { name, slug, description, skillName, resources } = meta;
  const totalResources =
    resources.data_products.length + resources.connectors.length + resources.workflows.length;

  return `# AGENTS.md — ${name}

> Agent-ready context for this Loxtep project. This file is scaffolded by
> \`loxtep init --template ${slug}\`. It tells an AI coding agent (Claude Code,
> Cursor, Copilot, etc.) how to operate on this project through the Loxtep
> SDK, CLI, and hosted MCP server, and which resources the default Skill
> permits.

## What this project is

${description}

This project was scaffolded from the **${slug}** template. It defines
${totalResources} resource${totalResources === 1 ? '' : 's'} across data
products, connectors/connections, and workflows (listed under
[Workspace resources](#workspace-resources)).

## Workspace layout

\`\`\`
.loxtep/
  project.json            # project config (id, instance binding, repository)
  skills/${skillName}.yaml  # default scoped Skill (see "Skill scope" below)
  generated/index.ts      # typed constants from loxtep generate (after attach)
domains/                  # domain definitions
connectors/               # connector/connection definitions
workflows/                # code-first Data_Workflow_Modules (*.ts)
data-products/            # data product definitions
\`\`\`

## CLI lifecycle

| Command | Purpose |
| --- | --- |
| \`loxtep login\` | Authenticate the CLI/SDK against the platform. |
| \`loxtep attach [--instance <id>]\` | Link this project to a Loxtep Instance; writes \`instance_id\` + \`api_url\` (and the bound \`repository\` block) into \`.loxtep/project.json\`. |
| \`loxtep generate\` | Compile connected resources into typed constants at \`.loxtep/generated/index.ts\` and validate every \`.loxtep/skills/*.yaml\` against the Workspace Context. |
| \`loxtep test <module> --event <file>\` | Run one workflow module locally against the attached instance; guarded operations prompt for approval. |
| \`loxtep deploy\` | Compile + deploy workflow modules through the platform deploy pipeline. |
| \`loxtep activity list\` | Read the unified action-trace + audit history. |
| \`loxtep improvements list\|apply\|reject\` | Review and adopt AI-Eval-derived workflow improvements. |

> After scaffolding, run \`loxtep login\`, then \`loxtep attach\`, then
> \`loxtep generate\` to produce typed constants for this workspace.

## SDK methods

- \`LoxtepClient.fromWorkspace()\` — construct a client from \`.loxtep/project.json\` (resolves \`api_url\`/\`project_id\`/\`instance_id\` + credentials).
- \`defineDataWorkflow({...})\` — author a code-first \`Data_Workflow_Module\` with typed triggers (\`on.queueEvent\` / \`on.connectorEvent\` / \`on.schedule\` / \`on.webhook\`).
- \`toolbox.*\` — **deterministic** typed platform calls (no model in the loop); returns typed results or throws.
- \`agent({ prompt, skills })\` — **agentic** entry point restricted to the union of the supplied skills' scopes; out-of-scope reaches are blocked before any platform call and recorded in the action trace.
- \`client.data_products\`, \`client.connectors\`, \`client.workflows\`, \`client.domains\`, \`client.queues\` — typed resource namespaces.

## MCP tools (hosted at \`mcp.loxtep.io\`)

When this workspace is connected, the hosted MCP server scopes tool calls to
this project's \`project_id\` + \`instance_id\` and exposes a
\`loxtep_workspace_context\` resource projecting the project's data products,
connectors, domains, queues, flows, and workflows (plus the bound repository
when set). Tool calls that carry a skill name are checked against that skill's
scope **before** execution; an out-of-scope resource is rejected with
\`SCOPE_VIOLATION\` and a denied operation is rejected without mutating any
resource (fail-closed).

## Skill scope

The default Skill for this template is
\`.loxtep/skills/${skillName}.yaml\`. It grants **read-only** access scoped to
**only** the resources this template defines. Anything not listed there is
denied by default.

\`\`\`yaml
name: ${skillName}
scope:        # permitted resource identifiers, per type
${RESOURCE_TYPES.map((t) => `  ${t}: ${yamlList(resources[t] || [])}`).join('\n')}
permissions:  # allowed operations per type (read|write|create|delete); unlisted ⇒ denied
${
  resources.data_products.length + resources.connectors.length + resources.workflows.length === 0
    ? '  data_products: [read]\n  workflows: [read]'
    : RESOURCE_TYPES.filter((t) => (resources[t] || []).length > 0)
        .map((t) => `  ${t}: [read]`)
        .join('\n')
}
\`\`\`

To let an agent **create or modify** resources, add the operation to the
matching \`permissions\` entry (for example \`workflows: [read, write]\`) or add
a new identifier under \`scope\`. Then run \`loxtep generate\` to re-validate the
skill against the Workspace Context.

## Workspace resources

These are the resources defined by the **${slug}** template (referenced by
their template slugs until \`loxtep generate\` resolves them to platform ids):

- **Data products:**
${bullets(resources.data_products)}
- **Connectors / connections:**
${bullets(resources.connectors)}
- **Workflows:**
${bullets(resources.workflows)}

## Conventions for agents

- Prefer \`toolbox\` (deterministic) calls for predictable work; use \`agent()\` only for reasoning/classification, always with an explicit \`skills\` allowlist.
- Never widen a skill's scope or permissions silently — surface the change to the developer.
- Reference resources by their generated typed constants (after \`loxtep generate\`) rather than hardcoding ids.
- Treat \`.loxtep/skills/*.yaml\` as the source of truth for what this project's agents may reach.
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('='.repeat(70));
console.log(`Per-template AGENTS.md + default skill generation${CHECK ? ' (--check)' : ''}`);
console.log('='.repeat(70));

// 1. Skill schema
writeOrCheck(
  join(SCHEMAS_DIR, 'skill-package-v1.schema.json'),
  JSON.stringify(SKILL_SCHEMA, null, 2) + '\n'
);

// 2. Per-template AGENTS.md + default skill
const manifest = readJson(MANIFEST_PATH);
const demosBySlug = new Map((manifest.demos || []).map((d) => [d.slug, d]));

const projectSlugs = readdirSync(PROJECTS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort((a, b) => a.localeCompare(b));

for (const slug of projectSlugs) {
  const projectDir = join(PROJECTS_DIR, slug);
  const projectJsonPath = join(projectDir, 'project.json');
  if (!existsSync(projectJsonPath)) continue;

  const project = readJson(projectJsonPath);
  const name = project.name || slug;
  const description = project.description || '';
  const skillName = `${slug.replace(/_/g, '-')}-default`;
  const resources = collectTemplateResources(projectDir);

  const meta = { name, slug, description, skillName, resources };

  // AGENTS.md at the template root (materialized into project root by init).
  writeOrCheck(join(projectDir, 'AGENTS.md'), emitAgentsMd(meta));

  // Default scoped skill under .loxtep/skills/.
  writeOrCheck(
    join(projectDir, '.loxtep', 'skills', `${skillName}.yaml`),
    emitSkillYaml(skillName, name, resources)
  );

  // 3. Scaffolding metadata on the manifest demos[] entry.
  const demo = demosBySlug.get(slug);
  if (demo) {
    demo.scaffold = {
      agents_md: 'AGENTS.md',
      default_skill: {
        name: skillName,
        path: `.loxtep/skills/${skillName}.yaml`,
      },
      scope: {
        data_products: resources.data_products,
        connectors: resources.connectors,
        workflows: resources.workflows,
      },
    };
  }
}

// Persist manifest scaffolding metadata.
writeOrCheck(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

console.log('-'.repeat(70));
if (CHECK) {
  if (drift.length > 0) {
    console.log(`Drift detected in ${drift.length} file(s):`);
    for (const d of drift) console.log(`  ✗ ${d}`);
    console.log('\nRun `node scripts/generate-template-agents.mjs` to regenerate.');
    process.exit(1);
  }
  console.log('✅ All generated artifacts are up to date.');
} else {
  console.log('✅ Generation complete.');
}
