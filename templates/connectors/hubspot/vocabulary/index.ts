/**
 * HubSpot Vocabulary Entries (Canonical Source)
 *
 * Community-contributable vocabulary data for HubSpot connector entities:
 * contacts, companies, deals.
 *
 * This file is the canonical source of truth for HubSpot vocabulary data.
 * The runtime logic (types, registry, lookup) lives in platform-backend.
 */

import type { VocabularyEntry } from '../../vocabulary-types';

const SCHEMA_NS = 'https://schema.org/';

// ─── Contacts ────────────────────────────────────────────────────────────────

const hubspotContacts: VocabularyEntry = {
  connector_type: 'hubspot',
  sync_entity: 'contacts',
  version: '1.0.0',
  last_verified: '2025-01-15T00:00:00.000Z',
  template_slug: 'hubspot',
  canonical_type_uri: `${SCHEMA_NS}Person`,
  confidence_override: 'curated',
  confidence_score: 0.85,
  description: 'HubSpot contacts representing individuals in the CRM with lifecycle tracking.',
  json_schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['vid', 'email'],
    properties: {
      vid: { type: 'number', description: 'Unique contact identifier' },
      email: { type: 'string', format: 'email', description: 'Contact email address' },
      firstname: { type: 'string', description: 'Contact first name' },
      lastname: { type: 'string', description: 'Contact last name' },
      phone: { type: 'string', description: 'Contact phone number' },
      company: { type: 'string', description: 'Associated company name' },
      createdate: { type: 'string', format: 'date-time', description: 'Contact creation timestamp' },
      lastmodifieddate: { type: 'string', format: 'date-time', description: 'Last modification timestamp' },
      lifecyclestage: { type: 'string', description: 'Lifecycle stage (subscriber, lead, opportunity, customer)' },
    },
  },
  fields: [
    { name: 'vid', type: 'number', required: true, description: 'Unique contact identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'email', type: 'string', required: true, description: 'Contact email address', canonical_property_uri: `${SCHEMA_NS}email`, format: 'email' },
    { name: 'firstname', type: 'string', required: false, description: 'Contact first name', canonical_property_uri: `${SCHEMA_NS}givenName` },
    { name: 'lastname', type: 'string', required: false, description: 'Contact last name', canonical_property_uri: `${SCHEMA_NS}familyName` },
    { name: 'phone', type: 'string', required: false, description: 'Contact phone number', canonical_property_uri: `${SCHEMA_NS}telephone` },
    { name: 'company', type: 'string', required: false, description: 'Associated company name', canonical_property_uri: `${SCHEMA_NS}worksFor` },
    { name: 'createdate', type: 'string', required: false, description: 'Contact creation timestamp', canonical_property_uri: `${SCHEMA_NS}dateCreated`, format: 'date-time' },
    { name: 'lastmodifieddate', type: 'string', required: false, description: 'Last modification timestamp', canonical_property_uri: `${SCHEMA_NS}dateModified`, format: 'date-time' },
    { name: 'lifecyclestage', type: 'string', required: false, description: 'Lifecycle stage (subscriber, lead, opportunity, customer)', canonical_property_uri: null },
  ],
  validation_rules: [
    { rule_id: 'hubspot-contacts-vid-required', description: 'Contact ID must be present', severity: 'warning', constraint: { required: ['vid'] }, target_fields: ['vid'] },
    { rule_id: 'hubspot-contacts-email-required', description: 'Contact email must be present', severity: 'warning', constraint: { required: ['email'] }, target_fields: ['email'] },
    { rule_id: 'hubspot-contacts-email-format', description: 'Contact email must be valid', severity: 'warning', constraint: { properties: { email: { format: 'email' } } }, target_fields: ['email'] },
  ],
  transformation_template: {
    steps: [
      { order: 0, transform_type: 'rename-field', operation_config: { mappings: { vid: 'id', firstname: 'givenName', lastname: 'familyName', phone: 'telephone', company: 'worksFor', createdate: 'dateCreated', lastmodifieddate: 'dateModified' } }, description: 'Rename HubSpot contact fields to schema.org canonical names' },
      { order: 1, transform_type: 'format-timestamp', operation_config: { fields: ['dateCreated', 'dateModified'], input_format: 'ISO8601', output_format: 'ISO8601' }, description: 'Normalize timestamps to ISO 8601' },
      { order: 2, transform_type: 'select-fields', operation_config: { fields: ['id', 'email', 'givenName', 'familyName', 'telephone', 'worksFor', 'dateCreated', 'dateModified', 'lifecyclestage'] }, description: 'Select mapped fields' },
    ],
    sample_input: [
      { vid: 101, email: 'jane@acme.com', firstname: 'Jane', lastname: 'Doe', phone: '+15551234567', company: 'Acme Corp', createdate: '2024-03-15T10:00:00.000Z', lastmodifieddate: '2025-01-10T14:30:00.000Z', lifecyclestage: 'customer' },
      { vid: 102, email: 'john@startup.io', firstname: 'John', lastname: 'Smith', phone: null, company: 'Startup Inc', createdate: '2024-06-20T08:00:00.000Z', lastmodifieddate: '2025-01-11T09:15:00.000Z', lifecyclestage: 'lead' },
      { vid: 103, email: 'alex@bigco.com', firstname: 'Alex', lastname: 'Johnson', phone: '+44207946000', company: 'BigCo Ltd', createdate: '2025-01-01T12:00:00.000Z', lastmodifieddate: '2025-01-12T16:45:00.000Z', lifecyclestage: 'subscriber' },
    ],
    expected_output: [
      { id: 101, email: 'jane@acme.com', givenName: 'Jane', familyName: 'Doe', telephone: '+15551234567', worksFor: 'Acme Corp', dateCreated: '2024-03-15T10:00:00.000Z', dateModified: '2025-01-10T14:30:00.000Z', lifecyclestage: 'customer' },
      { id: 102, email: 'john@startup.io', givenName: 'John', familyName: 'Smith', telephone: null, worksFor: 'Startup Inc', dateCreated: '2024-06-20T08:00:00.000Z', dateModified: '2025-01-11T09:15:00.000Z', lifecyclestage: 'lead' },
      { id: 103, email: 'alex@bigco.com', givenName: 'Alex', familyName: 'Johnson', telephone: '+44207946000', worksFor: 'BigCo Ltd', dateCreated: '2025-01-01T12:00:00.000Z', dateModified: '2025-01-12T16:45:00.000Z', lifecyclestage: 'subscriber' },
    ],
  },
  relationships: [
    { source_field: 'company', target_entity_type: 'companies', relationship_uri: `${SCHEMA_NS}worksFor`, cardinality: 'one-to-one' },
  ],
};

// ─── Companies ───────────────────────────────────────────────────────────────

const hubspotCompanies: VocabularyEntry = {
  connector_type: 'hubspot',
  sync_entity: 'companies',
  version: '1.0.0',
  last_verified: '2025-01-15T00:00:00.000Z',
  template_slug: 'hubspot',
  canonical_type_uri: `${SCHEMA_NS}Organization`,
  confidence_override: 'curated',
  confidence_score: 0.85,
  description: 'HubSpot companies representing organizations in the CRM.',
  json_schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['companyId', 'name'],
    properties: {
      companyId: { type: 'number', description: 'Unique company identifier' },
      name: { type: 'string', description: 'Company name' },
      domain: { type: 'string', description: 'Company website domain' },
      industry: { type: 'string', description: 'Industry classification' },
      phone: { type: 'string', description: 'Company phone number' },
      city: { type: 'string', description: 'City' },
      state: { type: 'string', description: 'State or region' },
      country: { type: 'string', description: 'Country' },
      createdate: { type: 'string', format: 'date-time', description: 'Company creation timestamp' },
    },
  },
  fields: [
    { name: 'companyId', type: 'number', required: true, description: 'Unique company identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'name', type: 'string', required: true, description: 'Company name', canonical_property_uri: `${SCHEMA_NS}name` },
    { name: 'domain', type: 'string', required: false, description: 'Company website domain', canonical_property_uri: `${SCHEMA_NS}url` },
    { name: 'industry', type: 'string', required: false, description: 'Industry classification', canonical_property_uri: null },
    { name: 'phone', type: 'string', required: false, description: 'Company phone number', canonical_property_uri: `${SCHEMA_NS}telephone` },
    { name: 'city', type: 'string', required: false, description: 'City', canonical_property_uri: null },
    { name: 'state', type: 'string', required: false, description: 'State or region', canonical_property_uri: null },
    { name: 'country', type: 'string', required: false, description: 'Country', canonical_property_uri: null },
    { name: 'createdate', type: 'string', required: false, description: 'Company creation timestamp', canonical_property_uri: `${SCHEMA_NS}dateCreated`, format: 'date-time' },
  ],
  validation_rules: [
    { rule_id: 'hubspot-companies-id-required', description: 'Company ID must be present', severity: 'warning', constraint: { required: ['companyId'] }, target_fields: ['companyId'] },
    { rule_id: 'hubspot-companies-name-required', description: 'Company name must be present', severity: 'warning', constraint: { required: ['name'] }, target_fields: ['name'] },
  ],
  transformation_template: {
    steps: [
      { order: 0, transform_type: 'rename-field', operation_config: { mappings: { companyId: 'id', domain: 'url', phone: 'telephone', createdate: 'dateCreated' } }, description: 'Rename HubSpot company fields to schema.org canonical names' },
      { order: 1, transform_type: 'format-timestamp', operation_config: { fields: ['dateCreated'], input_format: 'ISO8601', output_format: 'ISO8601' }, description: 'Normalize timestamps' },
      { order: 2, transform_type: 'select-fields', operation_config: { fields: ['id', 'name', 'url', 'industry', 'telephone', 'city', 'state', 'country', 'dateCreated'] }, description: 'Select mapped fields' },
    ],
    sample_input: [
      { companyId: 201, name: 'Acme Corp', domain: 'acme.com', industry: 'Technology', phone: '+15559876543', city: 'San Francisco', state: 'CA', country: 'US', createdate: '2023-06-01T09:00:00.000Z' },
      { companyId: 202, name: 'Startup Inc', domain: 'startup.io', industry: 'SaaS', phone: '+15551112222', city: 'Austin', state: 'TX', country: 'US', createdate: '2024-01-15T14:00:00.000Z' },
      { companyId: 203, name: 'BigCo Ltd', domain: 'bigco.com', industry: 'Finance', phone: '+44207946111', city: 'London', state: null, country: 'GB', createdate: '2024-09-10T11:30:00.000Z' },
    ],
    expected_output: [
      { id: 201, name: 'Acme Corp', url: 'acme.com', industry: 'Technology', telephone: '+15559876543', city: 'San Francisco', state: 'CA', country: 'US', dateCreated: '2023-06-01T09:00:00.000Z' },
      { id: 202, name: 'Startup Inc', url: 'startup.io', industry: 'SaaS', telephone: '+15551112222', city: 'Austin', state: 'TX', country: 'US', dateCreated: '2024-01-15T14:00:00.000Z' },
      { id: 203, name: 'BigCo Ltd', url: 'bigco.com', industry: 'Finance', telephone: '+44207946111', city: 'London', state: null, country: 'GB', dateCreated: '2024-09-10T11:30:00.000Z' },
    ],
  },
  relationships: [],
};

// ─── Deals ───────────────────────────────────────────────────────────────────

const hubspotDeals: VocabularyEntry = {
  connector_type: 'hubspot',
  sync_entity: 'deals',
  version: '1.0.0',
  last_verified: '2025-01-15T00:00:00.000Z',
  template_slug: 'hubspot',
  canonical_type_uri: `${SCHEMA_NS}TradeAction`,
  confidence_override: 'curated',
  confidence_score: 0.85,
  description: 'HubSpot deals representing sales opportunities in the pipeline.',
  json_schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['dealId', 'dealname'],
    properties: {
      dealId: { type: 'number', description: 'Unique deal identifier' },
      dealname: { type: 'string', description: 'Deal name' },
      amount: { type: 'string', description: 'Deal amount' },
      dealstage: { type: 'string', description: 'Current deal stage' },
      pipeline: { type: 'string', description: 'Pipeline the deal belongs to' },
      closedate: { type: 'string', format: 'date-time', description: 'Expected close date' },
      createdate: { type: 'string', format: 'date-time', description: 'Deal creation timestamp' },
      hubspot_owner_id: { type: 'string', description: 'Owner user ID' },
    },
  },
  fields: [
    { name: 'dealId', type: 'number', required: true, description: 'Unique deal identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'dealname', type: 'string', required: true, description: 'Deal name', canonical_property_uri: `${SCHEMA_NS}name` },
    { name: 'amount', type: 'string', required: false, description: 'Deal amount', canonical_property_uri: `${SCHEMA_NS}price` },
    { name: 'dealstage', type: 'string', required: false, description: 'Current deal stage', canonical_property_uri: `${SCHEMA_NS}actionStatus` },
    { name: 'pipeline', type: 'string', required: false, description: 'Pipeline the deal belongs to', canonical_property_uri: null },
    { name: 'closedate', type: 'string', required: false, description: 'Expected close date', canonical_property_uri: `${SCHEMA_NS}endTime`, format: 'date-time' },
    { name: 'createdate', type: 'string', required: false, description: 'Deal creation timestamp', canonical_property_uri: `${SCHEMA_NS}startTime`, format: 'date-time' },
    { name: 'hubspot_owner_id', type: 'string', required: false, description: 'Owner user ID', canonical_property_uri: `${SCHEMA_NS}agent` },
  ],
  validation_rules: [
    { rule_id: 'hubspot-deals-id-required', description: 'Deal ID must be present', severity: 'warning', constraint: { required: ['dealId'] }, target_fields: ['dealId'] },
    { rule_id: 'hubspot-deals-name-required', description: 'Deal name must be present', severity: 'warning', constraint: { required: ['dealname'] }, target_fields: ['dealname'] },
  ],
  transformation_template: {
    steps: [
      { order: 0, transform_type: 'rename-field', operation_config: { mappings: { dealId: 'id', dealname: 'name', amount: 'price', dealstage: 'actionStatus', closedate: 'endTime', createdate: 'startTime', hubspot_owner_id: 'agent' } }, description: 'Rename HubSpot deal fields to schema.org canonical names' },
      { order: 1, transform_type: 'format-timestamp', operation_config: { fields: ['startTime', 'endTime'], input_format: 'ISO8601', output_format: 'ISO8601' }, description: 'Normalize timestamps' },
      { order: 2, transform_type: 'select-fields', operation_config: { fields: ['id', 'name', 'price', 'actionStatus', 'pipeline', 'endTime', 'startTime', 'agent'] }, description: 'Select mapped fields' },
    ],
    sample_input: [
      { dealId: 301, dealname: 'Acme Enterprise License', amount: '50000', dealstage: 'closedwon', pipeline: 'default', closedate: '2025-01-15T00:00:00.000Z', createdate: '2024-10-01T09:00:00.000Z', hubspot_owner_id: 'owner-1' },
      { dealId: 302, dealname: 'Startup Pro Plan', amount: '12000', dealstage: 'qualifiedtobuy', pipeline: 'default', closedate: '2025-03-01T00:00:00.000Z', createdate: '2024-12-01T14:00:00.000Z', hubspot_owner_id: 'owner-2' },
      { dealId: 303, dealname: 'BigCo Custom Integration', amount: '85000', dealstage: 'presentationscheduled', pipeline: 'enterprise', closedate: '2025-06-15T00:00:00.000Z', createdate: '2025-01-05T11:30:00.000Z', hubspot_owner_id: 'owner-1' },
    ],
    expected_output: [
      { id: 301, name: 'Acme Enterprise License', price: '50000', actionStatus: 'closedwon', pipeline: 'default', endTime: '2025-01-15T00:00:00.000Z', startTime: '2024-10-01T09:00:00.000Z', agent: 'owner-1' },
      { id: 302, name: 'Startup Pro Plan', price: '12000', actionStatus: 'qualifiedtobuy', pipeline: 'default', endTime: '2025-03-01T00:00:00.000Z', startTime: '2024-12-01T14:00:00.000Z', agent: 'owner-2' },
      { id: 303, name: 'BigCo Custom Integration', price: '85000', actionStatus: 'presentationscheduled', pipeline: 'enterprise', endTime: '2025-06-15T00:00:00.000Z', startTime: '2025-01-05T11:30:00.000Z', agent: 'owner-1' },
    ],
  },
  relationships: [],
};

// ─── Export ──────────────────────────────────────────────────────────────────

/** All HubSpot vocabulary entries (community-contributable data) */
export const HUBSPOT_ENTRIES: VocabularyEntry[] = [
  hubspotContacts,
  hubspotCompanies,
  hubspotDeals,
];
