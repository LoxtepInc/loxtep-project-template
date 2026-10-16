/**
 * Every catalog connector must expose an icon the picker can render.
 * The UI treats icon_url as an <img> src when it is an http(s) URL or a
 * site-absolute path. Null, missing, and HTML page URLs show a blank card.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONNECTORS_DIR = path.join(ROOT, 'templates', 'connectors');

const ICON_URL = /^(https?:\/\/\S+|\/\S+\.(?:svg|png|jpe?g|webp|ico))$/;

function connectorFiles() {
  return fs
    .readdirSync(CONNECTORS_DIR)
    .map((slug) => path.join(CONNECTORS_DIR, slug, 'connector.json'))
    .filter((file) => fs.existsSync(file))
    .sort();
}

describe('connector icon_url', () => {
  const files = connectorFiles();

  it('covers the catalog', () => {
    assert.ok(files.length >= 40, `expected the connector catalog, found ${files.length}`);
  });

  for (const file of files) {
    const slug = path.basename(path.dirname(file));
    it(`${slug} has a renderable icon_url`, () => {
      const connector = JSON.parse(fs.readFileSync(file, 'utf8'));
      const iconUrl = connector.entity?.icon_url;
      assert.equal(typeof iconUrl, 'string', `${slug} entity.icon_url must be a string`);
      assert.match(iconUrl, ICON_URL, `${slug} icon_url is not an image URL: ${iconUrl}`);
    });
  }
});
