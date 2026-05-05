/**
 * Gorgias Vocabulary Entries (Canonical Source — Mapping Only)
 */
import type { VocabularyEntry } from '../../vocabulary-types';

const SCHEMA_NS = 'https://schema.org/';

const gorgiasTickets: VocabularyEntry = {
  connector_type: 'gorgias', sync_entity: 'tickets', version: '1.0.0', last_verified: '2025-01-15T00:00:00.000Z', template_slug: 'gorgias',
  canonical_type_uri: `${SCHEMA_NS}Message`, confidence_override: 'curated', confidence_score: 0.85,
  description: 'Gorgias tickets representing customer support conversations.',
  json_schema: { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object', required: ['id', 'subject', 'status'], properties: { id: { type: 'number' }, subject: { type: 'string' }, status: { type: 'string' }, priority: { type: 'string' }, created_datetime: { type: 'string', format: 'date-time' }, updated_datetime: { type: 'string', format: 'date-time' }, customer: { type: 'object' }, channel: { type: 'string' } } },
  fields: [
    { name: 'id', type: 'number', required: true, description: 'Unique ticket identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'subject', type: 'string', required: true, description: 'Ticket subject line', canonical_property_uri: `${SCHEMA_NS}name` },
    { name: 'status', type: 'string', required: true, description: 'Ticket status (open, closed)', canonical_property_uri: `${SCHEMA_NS}actionStatus` },
    { name: 'priority', type: 'string', required: false, description: 'Ticket priority level', canonical_property_uri: null },
    { name: 'created_datetime', type: 'string', required: false, description: 'Ticket creation timestamp', canonical_property_uri: `${SCHEMA_NS}dateCreated`, format: 'date-time' },
    { name: 'updated_datetime', type: 'string', required: false, description: 'Last update timestamp', canonical_property_uri: `${SCHEMA_NS}dateModified`, format: 'date-time' },
    { name: 'customer', type: 'object', required: false, description: 'Associated customer', canonical_property_uri: `${SCHEMA_NS}sender` },
    { name: 'channel', type: 'string', required: false, description: 'Communication channel', canonical_property_uri: null },
  ],
  validation_rules: [
    { rule_id: 'gorgias-tickets-id-required', description: 'Ticket ID must be present', severity: 'warning', constraint: { required: ['id'] }, target_fields: ['id'] },
    { rule_id: 'gorgias-tickets-subject-required', description: 'Ticket subject must be present', severity: 'warning', constraint: { required: ['subject'] }, target_fields: ['subject'] },
  ],
  transformation_template: null,
  relationships: [{ source_field: 'customer', target_entity_type: 'customers', relationship_uri: `${SCHEMA_NS}sender`, cardinality: 'one-to-one' }],
};

const gorgiasCustomers: VocabularyEntry = {
  connector_type: 'gorgias', sync_entity: 'customers', version: '1.0.0', last_verified: '2025-01-15T00:00:00.000Z', template_slug: 'gorgias',
  canonical_type_uri: `${SCHEMA_NS}Person`, confidence_override: 'curated', confidence_score: 0.85,
  description: 'Gorgias customers representing support contacts.',
  json_schema: { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object', required: ['id', 'email'], properties: { id: { type: 'number' }, email: { type: 'string', format: 'email' }, name: { type: 'string' }, created_datetime: { type: 'string', format: 'date-time' }, updated_datetime: { type: 'string', format: 'date-time' }, note: { type: 'string' } } },
  fields: [
    { name: 'id', type: 'number', required: true, description: 'Unique customer identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'email', type: 'string', required: true, description: 'Customer email', canonical_property_uri: `${SCHEMA_NS}email`, format: 'email' },
    { name: 'name', type: 'string', required: false, description: 'Customer name', canonical_property_uri: `${SCHEMA_NS}name` },
    { name: 'created_datetime', type: 'string', required: false, description: 'Creation timestamp', canonical_property_uri: `${SCHEMA_NS}dateCreated`, format: 'date-time' },
    { name: 'updated_datetime', type: 'string', required: false, description: 'Last update timestamp', canonical_property_uri: `${SCHEMA_NS}dateModified`, format: 'date-time' },
    { name: 'note', type: 'string', required: false, description: 'Customer note', canonical_property_uri: `${SCHEMA_NS}description` },
  ],
  validation_rules: [
    { rule_id: 'gorgias-customers-id-required', description: 'Customer ID must be present', severity: 'warning', constraint: { required: ['id'] }, target_fields: ['id'] },
    { rule_id: 'gorgias-customers-email-required', description: 'Customer email must be present', severity: 'warning', constraint: { required: ['email'] }, target_fields: ['email'] },
  ],
  transformation_template: null, relationships: [],
};

export const GORGIAS_ENTRIES: VocabularyEntry[] = [gorgiasTickets, gorgiasCustomers];
