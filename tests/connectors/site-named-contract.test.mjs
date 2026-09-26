/**
 * W10.2 — Contract tests for site-named connectors (Shopify, Stripe, Zendesk,
 * ShipStation, Salesforce):
 *   1. Every package action has a well-formed input_schema
 *   2. Sample fetch fixtures cover each sync_plan entity, validate against
 *      action input_schema + entity record schema, and extract via records_path
 *
 * Run: node --test tests/connectors/site-named-contract.test.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  getAtPath,
  validateInputSchemaShape,
  validateInstance,
} from '../../scripts/lib/json-schema-instance.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CONNECTORS_DIR = path.join(ROOT, 'templates', 'connectors');
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

/** Site-named connectors from readiness W10 / P1-8. */
const SITE_CONNECTORS = ['shopify', 'stripe', 'zendesk', 'shipstation', 'salesforce'];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadConnector(slug) {
  const connectorPath = path.join(CONNECTORS_DIR, slug, 'connector.json');
  assert.ok(fs.existsSync(connectorPath), `missing connector.json for ${slug}`);
  return readJson(connectorPath);
}

function loadActionDefinition(slug, definitionPath) {
  const full = path.join(CONNECTORS_DIR, slug, definitionPath);
  assert.ok(fs.existsSync(full), `missing action definition ${slug}/${definitionPath}`);
  return readJson(full);
}

function listFixtureFiles(slug) {
  const dir = path.join(FIXTURES_DIR, slug);
  assert.ok(fs.existsSync(dir), `missing fixtures dir for ${slug}`);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(dir, f));
}

describe('site-named connector contract (W10.2)', () => {
  for (const slug of SITE_CONNECTORS) {
    describe(slug, () => {
      const connector = loadConnector(slug);
      const pkg = connector.connector_package;
      assert.ok(pkg, `${slug}: connector_package required`);
      assert.equal(pkg.use_catalog_runtime, true, `${slug}: use_catalog_runtime`);

      const actions = pkg.actions || [];
      const syncEntities = pkg.sync_plan?.entities || {};
      const entityCatalog = pkg.entity_catalog || {};

      it('declares actions with valid input_schema shapes', () => {
        assert.ok(actions.length > 0, `${slug}: expected actions[]`);
        for (const entry of actions) {
          assert.ok(entry.key, `${slug}: action missing key`);
          assert.ok(entry.definition_path, `${slug}: ${entry.key} missing definition_path`);
          const def = loadActionDefinition(slug, entry.definition_path);
          assert.equal(def.key, entry.key, `${slug}: definition key mismatch for ${entry.key}`);
          assert.ok(def.input_schema, `${slug}: ${entry.key} missing input_schema`);
          const shapeErrors = validateInputSchemaShape(def.input_schema, `${slug}/${entry.key}`);
          assert.deepEqual(shapeErrors, [], shapeErrors.join('\n'));
        }
      });

      it('has sample-fetch fixtures for every sync_plan entity', () => {
        const entityKeys = Object.keys(syncEntities);
        assert.ok(entityKeys.length > 0, `${slug}: sync_plan.entities required`);

        const fixtures = listFixtureFiles(slug).map((f) => readJson(f));
        const byEntity = new Map(fixtures.map((fx) => [fx.entity, fx]));

        for (const entity of entityKeys) {
          const fx = byEntity.get(entity);
          assert.ok(fx, `${slug}: missing sample-fetch fixture for entity "${entity}"`);
          assert.equal(fx.action_key, syncEntities[entity].fetch_action_key);
          assert.ok(fx.response !== undefined, `${slug}/${entity}: fixture.response required`);
          assert.ok(fx.input !== undefined, `${slug}/${entity}: fixture.input required`);
        }

        assert.equal(
          fixtures.length,
          entityKeys.length,
          `${slug}: fixture count ${fixtures.length} !== sync entity count ${entityKeys.length}`
        );
      });

      it('validates fixture inputs against fetch action input_schema', () => {
        for (const file of listFixtureFiles(slug)) {
          const fx = readJson(file);
          const spec = syncEntities[fx.entity];
          assert.ok(spec, `${slug}: fixture entity ${fx.entity} not in sync_plan`);
          const actionEntry = actions.find((a) => a.key === fx.action_key);
          assert.ok(actionEntry, `${slug}: unknown action_key ${fx.action_key}`);
          const def = loadActionDefinition(slug, actionEntry.definition_path);
          const errors = validateInstance(fx.input, def.input_schema, 'input');
          assert.deepEqual(errors, [], `${path.basename(file)}:\n${errors.join('\n')}`);
        }
      });

      it('extracts fixture records via records_path and validates record schema', () => {
        for (const file of listFixtureFiles(slug)) {
          const fx = readJson(file);
          const spec = syncEntities[fx.entity];
          const catalog = entityCatalog[fx.entity];
          assert.ok(catalog?.record_schema_path, `${slug}/${fx.entity}: record_schema_path`);

          const schemaPath = path.join(CONNECTORS_DIR, slug, catalog.record_schema_path);
          assert.ok(fs.existsSync(schemaPath), `${slug}: missing ${catalog.record_schema_path}`);
          const recordSchema = readJson(schemaPath);

          const rawList = getAtPath(fx.response, spec.records_path ?? '');
          assert.ok(Array.isArray(rawList), `${slug}/${fx.entity}: records_path "${spec.records_path}" did not yield an array`);
          assert.ok(rawList.length > 0, `${slug}/${fx.entity}: fixture must include ≥1 sample record`);

          for (let i = 0; i < rawList.length; i++) {
            const errors = validateInstance(rawList[i], recordSchema, `records[${i}]`);
            assert.deepEqual(
              errors,
              [],
              `${slug}/${fx.entity} record[${i}]:\n${errors.join('\n')}`
            );
          }
        }
      });

      it('keeps trigger_config_spec sync_entity enum aligned with sync_plan', () => {
        const spec = connector.entity?.metadata?.trigger_config_spec;
        assert.ok(spec, `${slug}: trigger_config_spec required (W10.1)`);
        const enumVals = spec.fields?.sync_entity?.enum;
        assert.ok(Array.isArray(enumVals) && enumVals.length > 0, `${slug}: sync_entity.enum`);
        const syncKeys = Object.keys(syncEntities).sort();
        assert.deepEqual([...enumVals].sort(), syncKeys, `${slug}: trigger enum vs sync_plan`);
      });
    });
  }
});
