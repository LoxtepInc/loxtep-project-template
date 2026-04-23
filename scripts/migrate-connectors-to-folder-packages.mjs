/**
 * Migrates flat templates/connectors/{slug}.json → templates/connectors/{slug}/connector.json
 * and adds a minimal connector_package (Pipedream-style; actions filled in later).
 *
 * Also creates folder stubs for built-in platform connectors that had no flat template.
 *
 * Run: node scripts/migrate-connectors-to-folder-packages.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const connectorsDir = path.join(__dirname, '..', 'templates', 'connectors');

function ensureConnectorPackage(root) {
  if (root.connector_package && typeof root.connector_package === 'object') return;
  const v = root.version ?? '1.0.0';
  root.connector_package = {
    schema_version: 1,
    package_version: typeof v === 'string' ? v : '1.0.0',
    description:
      'Open connector package. Declarative actions live under actions/; migrate HTTP calls from the platform provider as needed.',
    actions: [],
  };
}

function writeConnectorJson(slug, root) {
  ensureConnectorPackage(root);
  const dir = path.join(connectorsDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'connector.json');
  fs.writeFileSync(out, `${JSON.stringify(root, null, 2)}\n`, 'utf8');
  return out;
}

/** Slugs that exist only in platform-backend providers (no flat template yet). */
const PLATFORM_STUBS = [
  {
    slug: 'stripe',
    name: 'Stripe',
    description: 'Sync Stripe customers, charges, subscriptions, invoices, products, and prices.',
    category: 'finance',
    auth_type: 'api_key',
    supported_entities: ['customers', 'charges', 'subscriptions', 'invoices', 'products', 'prices'],
  },
  {
    slug: 'github',
    name: 'GitHub',
    description: 'Connect GitHub for repositories, issues, pull requests, and workflows.',
    category: 'productivity',
    auth_type: 'oauth2',
    oauth_config: {
      authorization_url: 'https://github.com/login/oauth/authorize',
      token_url: 'https://github.com/login/oauth/access_token',
      scopes: ['read:user', 'repo'],
      response_type: 'code',
      grant_type: 'authorization_code',
    },
    supported_entities: ['repositories', 'issues', 'pull_requests'],
  },
  {
    slug: 'hubspot',
    name: 'HubSpot',
    description: 'Connect HubSpot CRM for contacts, companies, and deals.',
    category: 'crm',
    auth_type: 'oauth2',
    oauth_config: {
      authorization_url: 'https://app.hubspot.com/oauth/authorize',
      token_url: 'https://api.hubapi.com/oauth/v1/token',
      scopes: [
        'crm.objects.contacts.read',
        'crm.objects.companies.read',
        'crm.objects.deals.read',
        'crm.schemas.contacts.read',
        'crm.schemas.companies.read',
        'crm.schemas.deals.read',
        'oauth',
      ],
      response_type: 'code',
      grant_type: 'authorization_code',
    },
    supported_entities: ['contacts', 'companies', 'deals'],
  },
  {
    slug: 'gorgias',
    name: 'Gorgias',
    description: 'Gorgias helpdesk tickets and customers.',
    category: 'communication',
    auth_type: 'api_key',
    supported_entities: ['tickets', 'customers'],
  },
  {
    slug: 'klaviyo',
    name: 'Klaviyo',
    description: 'Klaviyo profiles, lists, and events.',
    category: 'marketing',
    auth_type: 'api_key',
    supported_entities: ['profiles', 'lists', 'events'],
  },
  {
    slug: 'shipbob',
    name: 'ShipBob',
    description: 'ShipBob fulfillment and inventory.',
    category: 'custom',
    auth_type: 'api_key',
    supported_entities: ['orders', 'inventory', 'shipments'],
  },
  {
    slug: 'salesforce',
    name: 'Salesforce',
    description: 'Salesforce CRM via Composio-backed connector (toolkit configuration in platform).',
    category: 'crm',
    auth_type: 'oauth2',
    oauth_config: {
      authorization_url: 'https://login.salesforce.com/services/oauth2/authorize',
      token_url: 'https://login.salesforce.com/services/oauth2/token',
      scopes: ['api', 'refresh_token'],
      response_type: 'code',
      grant_type: 'authorization_code',
    },
    supported_entities: ['contacts', 'accounts', 'opportunities'],
    metadata: { backend: 'composio' },
  },
  {
    slug: 'quickbooks',
    name: 'QuickBooks',
    description: 'QuickBooks Online accounting data.',
    category: 'finance',
    auth_type: 'oauth2',
    oauth_config: {
      authorization_url: 'https://appcenter.intuit.com/connect/oauth2',
      token_url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      scopes: ['com.intuit.quickbooks.accounting'],
      response_type: 'code',
      grant_type: 'authorization_code',
    },
    supported_entities: ['customers', 'invoices', 'payments'],
    metadata: { backend: 'composio' },
  },
  {
    slug: 'mysql-source',
    name: 'MySQL Source',
    description: 'MySQL database source connector.',
    category: 'database',
    auth_type: 'basic',
    supported_entities: [],
  },
  {
    slug: 's3-destination',
    name: 'S3 Destination',
    description: 'Write mesh data to Amazon S3.',
    category: 'file_storage',
    auth_type: 'api_key',
    supported_entities: [],
  },
  {
    slug: 'webhook-destination',
    name: 'Webhook Destination',
    description: 'Push events to an HTTPS webhook endpoint.',
    category: 'custom',
    auth_type: 'custom',
    supported_entities: [],
  },
];

function stubToConnectorJson(spec) {
  const slug = spec.slug;
  const now = '{{CREATED_AT}}';
  return {
    $schema: 'https://loxtep.io/schemas/template/connector.json',
    template_type: 'connector',
    slug,
    name: `${spec.name} Connector`,
    description: spec.description,
    version: '1.0.0',
    tags: [slug],
    use_cases: [spec.description],
    entity: {
      connector_id: '{{CONNECTOR_ID}}',
      organization_id: '{{ORGANIZATION_ID}}',
      project_id: '{{PROJECT_ID}}',
      connector_type: slug,
      name: spec.name,
      description: spec.description,
      category: spec.category,
      auth_type: spec.auth_type,
      oauth_config: spec.oauth_config ?? null,
      supported_directions: ['inbound'],
      supported_entities: spec.supported_entities,
      supports_webhooks: spec.slug === 'stripe' || spec.slug === 'hubspot',
      supports_polling: true,
      required_scopes: spec.oauth_config?.scopes ?? null,
      version: '1.0.0',
      is_beta: false,
      metadata: {
        template_slug: slug,
        ...(spec.metadata ?? {}),
      },
      created_at: now,
      updated_at: '{{UPDATED_AT}}',
    },
    connection_template: {
      type: 'api',
      configuration: {},
    },
    placeholders: {
      '{{CONNECTOR_ID}}': 'Generated UUID for the connector',
      '{{ORGANIZATION_ID}}': 'Organization that owns this connector',
      '{{PROJECT_ID}}': 'Project that contains this connector',
      '{{CREATED_AT}}': 'ISO 8601 timestamp',
      '{{UPDATED_AT}}': 'ISO 8601 timestamp',
    },
  };
}

function migrateFlatFiles() {
  const names = fs.readdirSync(connectorsDir);
  const flat = names.filter(f => f.endsWith('.json') && !f.startsWith('.'));
  for (const file of flat) {
    const slug = file.replace(/\.json$/i, '');
    const src = path.join(connectorsDir, file);
    const raw = fs.readFileSync(src, 'utf8');
    const root = JSON.parse(raw);
    if (root.template_type !== 'connector') {
      console.warn('Skip non-connector:', file);
      continue;
    }
    const targetDir = path.join(connectorsDir, slug);
    if (fs.existsSync(path.join(targetDir, 'connector.json'))) {
      console.warn('Folder package already exists, skip:', slug);
      continue;
    }
    const out = writeConnectorJson(slug, root);
    fs.unlinkSync(src);
    console.warn('Migrated', file, '→', path.relative(path.join(__dirname, '..'), out));
  }
}

function writeStubs() {
  for (const spec of PLATFORM_STUBS) {
    const dir = path.join(connectorsDir, spec.slug);
    if (fs.existsSync(path.join(dir, 'connector.json'))) {
      console.warn('Stub exists, skip:', spec.slug);
      continue;
    }
    const root = stubToConnectorJson(spec);
    const out = writeConnectorJson(spec.slug, root);
    console.warn('Created stub', path.relative(path.join(__dirname, '..'), out));
  }
}

migrateFlatFiles();
writeStubs();
console.warn('Done.');
