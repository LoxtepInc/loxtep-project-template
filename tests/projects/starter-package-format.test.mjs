/**
 * Materialize each non-blank project starter with dummy UUIDs and lint it
 * with @loxtep/sdk 0.11.0. Unresolved placeholders are errors.
 *
 * SDK location: $LOXTEP_SDK_DIR or /tmp/sdk011/node_modules/@loxtep/sdk
 *   mkdir -p /tmp/sdk011 && cd /tmp/sdk011 && npm i @loxtep/sdk@0.11.0
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = join(import.meta.dirname, '..', '..');
const PROJECTS = join(ROOT, 'templates', 'projects');
const SKIP = new Set(['blank']);
const EXPECTED = [
  'education',
  'energy_utilities',
  'financial_services',
  'healthcare',
  'hospitality_travel',
  'manufacturing',
  'media_entertainment',
  'nonprofit_government',
  'professional_services',
  'real_estate',
  'retail_ecommerce',
  'retail_ecommerce_with_fulfillment',
  'technology',
];

const TEMPLATE_ID_NAMESPACE = '4d4f2f3b-6d42-4b10-8b9f-9b1d6e2d9c54';
const DUMMY_NAMESPACE = '8c2e1b0a-7d44-4f1e-9a33-6b5c0d1e2f30';
const CREATED_AT = '2026-01-01T00:00:00.000Z';

const PER_WORKFLOW_KEYS = [
  'WORKFLOW_ID',
  'CONNECTION_ID',
  'CONNECTOR_ID',
  'DATA_PRODUCT_ID',
  'DATA_PRODUCT_SINK_ID',
  'DATA_PRODUCT_SOURCE_ID',
];
const PER_PROJECT_KEYS = [
  'ORGANIZATION_ID',
  'PROJECT_ID',
  'DOMAIN_ID',
  'USER_ID',
  'OWNER_USER_ID',
];

function resolveSdkDir() {
  const candidates = [process.env.LOXTEP_SDK_DIR, '/tmp/sdk011/node_modules/@loxtep/sdk'].filter(Boolean);
  for (const dir of candidates) {
    if (existsSync(join(dir, 'dist', 'lib', 'workspace-lint.js'))) return dir;
  }
  throw new Error(
    'Cannot load @loxtep/sdk 0.11.0. Install it outside the repo with ' +
      '`mkdir -p /tmp/sdk011 && cd /tmp/sdk011 && npm i @loxtep/sdk@0.11.0` ' +
      'or set LOXTEP_SDK_DIR to the package root.'
  );
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function walkJson(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, name.name);
    if (name.isDirectory()) out.push(...walkJson(full));
    else if (name.isFile() && name.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function collectPlaceholders(value, found) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)) found.add(match[1]);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectPlaceholders(item, found);
    return;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectPlaceholders(item, found);
  }
}

function appliedShapeFieldCount(entity) {
  const schema = entity && entity.schema;
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return 0;
  return Array.isArray(schema.fields) ? schema.fields.length : 0;
}

function objectHasKey(value, key) {
  if (Array.isArray(value)) return value.some((item) => objectHasKey(item, key));
  if (value && typeof value === 'object') {
    if (Object.prototype.hasOwnProperty.call(value, key)) return true;
    return Object.values(value).some((item) => objectHasKey(item, key));
  }
  return false;
}

/**
 * Push refuses caller governance.pii_fields when the data product has no applied
 * Shape (schema.fields). The server derives pii_fields from those fields.
 * ODPS product.custom must not carry pii_fields either.
 */
function assertPushGovernance(entity, where) {
  const governance = entity.governance;
  const sendsPii =
    governance &&
    typeof governance === 'object' &&
    !Array.isArray(governance) &&
    Object.prototype.hasOwnProperty.call(governance, 'pii_fields');
  if (sendsPii && appliedShapeFieldCount(entity) === 0) {
    throw new Error(
      `${where}: governance.pii_fields cannot be sent without schema.fields ` +
        '(server derives pii_fields from the applied Shape)'
    );
  }
  const custom =
    entity.odps_document &&
    entity.odps_document.product &&
    entity.odps_document.product.custom;
  if (custom && objectHasKey(custom, 'pii_fields')) {
    throw new Error(`${where}: ODPS custom reintroduces pii_fields`);
  }
}

function replacePlaceholders(value, map, where) {
  if (typeof value === 'string') {
    return value.replace(/\{\{([A-Z0-9_]+)\}\}/g, (token, key) => {
      if (!Object.prototype.hasOwnProperty.call(map, key)) {
        throw new Error(`${where}: unresolved placeholder {{${key}}}`);
      }
      return map[key];
    });
  }
  if (Array.isArray(value)) return value.map((item) => replacePlaceholders(item, map, where));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = replacePlaceholders(item, map, where);
    return out;
  }
  return value;
}

test('materialized project starters pass @loxtep/sdk 0.11.0 lint', async () => {
  const sdkDir = resolveSdkDir();
  const pkg = readJson(join(sdkDir, 'package.json'));
  assert.equal(pkg.version, '0.11.0', `expected @loxtep/sdk 0.11.0, found ${pkg.version}`);

  const require = createRequire(join(sdkDir, 'package.json'));
  const { v5: uuidv5 } = require('uuid');
  const { lintLocalPackage } = await import(pathToFileURL(join(sdkDir, 'dist/lib/workspace-lint.js')).href);

  const slugs = readdirSync(PROJECTS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !SKIP.has(entry.name))
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(slugs, EXPECTED);

  const root = mkdtempSync(join(tmpdir(), 'loxtep-starters-'));
  try {
    for (const slug of slugs) {
      const projectDir = join(PROJECTS, slug);
      const workflowsDir = join(projectDir, 'workflows');
      const folders = readdirSync(workflowsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
      if (folders.length === 0) {
        throw new Error(`${slug}: no workflow folders`);
      }

      const projectMap = {};
      for (const key of PER_PROJECT_KEYS) {
        projectMap[key] = uuidv5(`${slug}/${key}`, DUMMY_NAMESPACE);
      }
      projectMap.CREATED_AT = CREATED_AT;
      projectMap.UPDATED_AT = CREATED_AT;

      const materialized = join(root, slug);
      for (const folder of folders) {
        const map = { ...projectMap };
        for (const key of PER_WORKFLOW_KEYS) {
          map[key] = uuidv5(`${slug}/${folder}/${key}`, DUMMY_NAMESPACE);
        }
        map.WORKFLOW_NAME = folder.replace(/-/g, ' ');

        const workflowDir = join(workflowsDir, folder);
        const found = new Set();
        for (const file of walkJson(workflowDir)) collectPlaceholders(readJson(file), found);
        if (found.has('TEMPLATE_ID')) {
          throw new Error(`${slug}/${folder}: template_id must be a stamped UUID, not {{TEMPLATE_ID}}`);
        }
        for (const key of found) {
          if (!Object.prototype.hasOwnProperty.call(map, key)) {
            throw new Error(`${slug}/${folder}: no materialization value for {{${key}}}`);
          }
        }

        const workflowFile = join(workflowDir, 'workflow.json');
        const workflowPkg = readJson(workflowFile);
        const expectedTemplateId = uuidv5(`workflow:workflows/${folder}`, TEMPLATE_ID_NAMESPACE);
        assert.equal(
          workflowPkg.entity.template_id,
          expectedTemplateId,
          `${slug}/${folder}: template_id must be uuidv5(workflow:workflows/${folder})`
        );

        const writeEntity = (src, dest) => {
          const pkg = readJson(src);
          if (!pkg.entity || typeof pkg.entity !== 'object') {
            throw new Error(`${src}: missing entity object`);
          }
          const entity = replacePlaceholders(pkg.entity, map, relative(ROOT, src));
          if (src.includes('/data-products/')) {
            assertPushGovernance(entity, relative(ROOT, src));
          }
          mkdirSync(join(dest, '..'), { recursive: true });
          writeFileSync(dest, JSON.stringify(entity, null, 2));
        };

        const outWorkflow = join(materialized, 'workflows', folder);
        writeEntity(workflowFile, join(outWorkflow, 'workflow.json'));
        for (const segment of ['connections', 'data-products']) {
          const srcDir = join(workflowDir, segment);
          if (!existsSync(srcDir)) continue;
          for (const name of readdirSync(srcDir)) {
            if (!name.endsWith('.json')) continue;
            writeEntity(join(srcDir, name), join(outWorkflow, segment, name));
          }
        }
      }

      const result = lintLocalPackage({ projectDir: materialized });
      if (!result.ok) {
        const detail = (result.issues || [])
          .map((issue) => `${issue.path}: ${issue.message}`)
          .join('\n');
        throw new Error(`${slug}: loxtep lint failed\n${detail}`);
      }
      assert.ok(result.files_checked > 0, `${slug}: lint checked no files`);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
