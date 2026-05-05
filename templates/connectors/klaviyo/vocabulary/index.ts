/**
 * Klaviyo Vocabulary Entries (Canonical Source — Mapping Only)
 *
 * Community-contributable vocabulary data for Klaviyo connector entities:
 * profiles, lists, events. No transformation templates (mapping-only).
 */

import type { VocabularyEntry } from '../../vocabulary-types';

const SCHEMA_NS = 'https://schema.org/';

const klaviyoProfiles: VocabularyEntry = {
  connector_type: 'klaviyo',
  sync_entity: 'profiles',
  version: '1.0.0',
  last_verified: '2025-01-15T00:00:00.000Z',
  template_slug: 'klaviyo',
  canonical_type_uri: `${SCHEMA_NS}Person`,
  confidence_override: 'curated',
  confidence_score: 0.85,
  description: 'Klaviyo profiles representing email/SMS subscribers.',
  json_schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['id', 'email'],
    properties: {
      id: { type: 'string', description: 'Unique profile identifier' },
      email: { type: 'string', format: 'email', description: 'Profile email address' },
      first_name: { type: 'string', description: 'First name' },
      last_name: { type: 'string', description: 'Last name' },
      phone_number: { type: 'string', description: 'Phone number' },
      created: { type: 'string', format: 'date-time', description: 'Profile creation timestamp' },
      updated: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
    },
  },
  fields: [
    { name: 'id', type: 'string', required: true, description: 'Unique profile identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'email', type: 'string', required: true, description: 'Profile email address', canonical_property_uri: `${SCHEMA_NS}email`, format: 'email' },
    { name: 'first_name', type: 'string', required: false, description: 'First name', canonical_property_uri: `${SCHEMA_NS}givenName` },
    { name: 'last_name', type: 'string', required: false, description: 'Last name', canonical_property_uri: `${SCHEMA_NS}familyName` },
    { name: 'phone_number', type: 'string', required: false, description: 'Phone number', canonical_property_uri: `${SCHEMA_NS}telephone` },
    { name: 'created', type: 'string', required: false, description: 'Profile creation timestamp', canonical_property_uri: `${SCHEMA_NS}dateCreated`, format: 'date-time' },
    { name: 'updated', type: 'string', required: false, description: 'Last update timestamp', canonical_property_uri: `${SCHEMA_NS}dateModified`, format: 'date-time' },
  ],
  validation_rules: [
    { rule_id: 'klaviyo-profiles-id-required', description: 'Profile ID must be present', severity: 'warning', constraint: { required: ['id'] }, target_fields: ['id'] },
    { rule_id: 'klaviyo-profiles-email-required', description: 'Profile email must be present', severity: 'warning', constraint: { required: ['email'] }, target_fields: ['email'] },
  ],
  transformation_template: null,
  relationships: [],
};

const klaviyoLists: VocabularyEntry = {
  connector_type: 'klaviyo',
  sync_entity: 'lists',
  version: '1.0.0',
  last_verified: '2025-01-15T00:00:00.000Z',
  template_slug: 'klaviyo',
  canonical_type_uri: `${SCHEMA_NS}ItemList`,
  confidence_override: 'curated',
  confidence_score: 0.85,
  description: 'Klaviyo lists representing subscriber segments.',
  json_schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['list_id', 'list_name'],
    properties: {
      list_id: { type: 'string', description: 'Unique list identifier' },
      list_name: { type: 'string', description: 'List name' },
      created: { type: 'string', format: 'date-time', description: 'List creation timestamp' },
      updated: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
      profile_count: { type: 'number', description: 'Number of profiles in the list' },
    },
  },
  fields: [
    { name: 'list_id', type: 'string', required: true, description: 'Unique list identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'list_name', type: 'string', required: true, description: 'List name', canonical_property_uri: `${SCHEMA_NS}name` },
    { name: 'created', type: 'string', required: false, description: 'List creation timestamp', canonical_property_uri: `${SCHEMA_NS}dateCreated`, format: 'date-time' },
    { name: 'updated', type: 'string', required: false, description: 'Last update timestamp', canonical_property_uri: `${SCHEMA_NS}dateModified`, format: 'date-time' },
    { name: 'profile_count', type: 'number', required: false, description: 'Number of profiles in the list', canonical_property_uri: `${SCHEMA_NS}numberOfItems` },
  ],
  validation_rules: [
    { rule_id: 'klaviyo-lists-id-required', description: 'List ID must be present', severity: 'warning', constraint: { required: ['list_id'] }, target_fields: ['list_id'] },
    { rule_id: 'klaviyo-lists-name-required', description: 'List name must be present', severity: 'warning', constraint: { required: ['list_name'] }, target_fields: ['list_name'] },
  ],
  transformation_template: null,
  relationships: [],
};

const klaviyoEvents: VocabularyEntry = {
  connector_type: 'klaviyo',
  sync_entity: 'events',
  version: '1.0.0',
  last_verified: '2025-01-15T00:00:00.000Z',
  template_slug: 'klaviyo',
  canonical_type_uri: `${SCHEMA_NS}Event`,
  confidence_override: 'curated',
  confidence_score: 0.85,
  description: 'Klaviyo events representing tracked user actions.',
  json_schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['id', 'type', 'timestamp'],
    properties: {
      id: { type: 'string', description: 'Unique event identifier' },
      type: { type: 'string', description: 'Event type/metric name' },
      timestamp: { type: 'string', format: 'date-time', description: 'Event timestamp' },
      person: { type: 'object', description: 'Associated profile' },
      properties: { type: 'object', description: 'Event properties/metadata' },
    },
  },
  fields: [
    { name: 'id', type: 'string', required: true, description: 'Unique event identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'type', type: 'string', required: true, description: 'Event type/metric name', canonical_property_uri: `${SCHEMA_NS}name` },
    { name: 'timestamp', type: 'string', required: true, description: 'Event timestamp', canonical_property_uri: `${SCHEMA_NS}startDate`, format: 'date-time' },
    { name: 'person', type: 'object', required: false, description: 'Associated profile', canonical_property_uri: `${SCHEMA_NS}attendee` },
    { name: 'properties', type: 'object', required: false, description: 'Event properties/metadata', canonical_property_uri: null },
  ],
  validation_rules: [
    { rule_id: 'klaviyo-events-id-required', description: 'Event ID must be present', severity: 'warning', constraint: { required: ['id'] }, target_fields: ['id'] },
    { rule_id: 'klaviyo-events-type-required', description: 'Event type must be present', severity: 'warning', constraint: { required: ['type'] }, target_fields: ['type'] },
  ],
  transformation_template: null,
  relationships: [],
};

export const KLAVIYO_ENTRIES: VocabularyEntry[] = [klaviyoProfiles, klaviyoLists, klaviyoEvents];
