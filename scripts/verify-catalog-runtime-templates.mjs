#!/usr/bin/env node
/**
 * Validates connector templates: catalog runtime packages and Composio adapter blocks.
 * Run from repo root: node scripts/verify-catalog-runtime-templates.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'templates', 'connectors');

function isComposioEntity(j) {
  return j?.entity?.backend === 'composio' || j?.entity?.metadata?.backend === 'composio';
}

let errors = 0;
for (const name of fs.readdirSync(root, { withFileTypes: true })) {
  if (!name.isDirectory()) continue;
  const p = path.join(root, name.name, 'connector.json');
  if (!fs.existsSync(p)) continue;
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  const pkg = j.connector_package;
  if (!pkg || typeof pkg !== 'object' || pkg.use_catalog_runtime !== true) continue;

  const slug = j.slug || name.name;
  const need = ['execution_policy', 'connection_probe', 'sync_plan', 'actions'];
  for (const k of need) {
    if (!(k in pkg) || pkg[k] === null) {
      console.error(`[${slug}] missing connector_package.${k}`);
      errors++;
    }
  }
  const probe = pkg.connection_probe;
  if (probe && typeof probe === 'object' && !probe.action_key) {
    console.error(`[${slug}] connection_probe.action_key required`);
    errors++;
  }

  const catalog = pkg.entity_catalog;
  if (catalog && typeof catalog === 'object') {
    for (const [etype, entry] of Object.entries(catalog)) {
      if (!entry || typeof entry !== 'object') continue;
      const sp = entry.record_schema_path;
      if (sp === undefined || sp === null) continue;
      if (typeof sp !== 'string' || !sp.trim()) {
        console.error(
          `[${slug}] entity_catalog.${etype}.record_schema_path must be a non-empty string when set`
        );
        errors++;
        continue;
      }
      const rel = sp.replace(/^\//, '');
      const schemaFile = path.join(root, name.name, rel);
      if (!fs.existsSync(schemaFile)) {
        console.error(`[${slug}] entity_catalog.${etype} record_schema_path missing file: ${rel}`);
        errors++;
        continue;
      }
      try {
        JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
      } catch (e) {
        console.error(`[${slug}] invalid JSON at ${rel}:`, e?.message || e);
        errors++;
      }
    }
  }
}

for (const name of fs.readdirSync(root, { withFileTypes: true })) {
  if (!name.isDirectory()) continue;
  const p = path.join(root, name.name, 'connector.json');
  if (!fs.existsSync(p)) continue;
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!isComposioEntity(j)) continue;
  const slug = j.slug || name.name;
  const ca = j.connector_package?.composio_adapter;
  if (!ca || typeof ca !== 'object') {
    console.error(`[${slug}] composio entity requires connector_package.composio_adapter`);
    errors++;
    continue;
  }
  if (!ca.toolkit_name || !Array.isArray(ca.entity_mappings) || !ca.entity_mappings.length) {
    console.error(`[${slug}] composio_adapter.toolkit_name and entity_mappings[] required`);
    errors++;
  }
}

if (errors) {
  console.error(`verify-catalog-runtime-templates: ${errors} error(s)`);
  process.exit(1);
}
console.log('verify-catalog-runtime-templates: ok');
