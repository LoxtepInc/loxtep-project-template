/**
 * NetSuite Vocabulary Entries (Canonical Source — Mapping Only)
 */
import type { VocabularyEntry } from '../../vocabulary-types';

const SCHEMA_NS = 'https://schema.org/';

const netsuiteItems: VocabularyEntry = {
  connector_type: 'netsuite', sync_entity: 'items', version: '1.0.0', last_verified: '2025-01-15T00:00:00.000Z', template_slug: 'netsuite',
  canonical_type_uri: `${SCHEMA_NS}Product`, confidence_override: 'curated', confidence_score: 0.85,
  description: 'NetSuite items representing inventory products.',
  json_schema: { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object', required: ['internalId', 'itemId'], properties: { internalId: { type: 'string' }, itemId: { type: 'string' }, displayName: { type: 'string' }, type: { type: 'string' }, basePrice: { type: 'number' }, quantityAvailable: { type: 'number' }, isInactive: { type: 'boolean' } } },
  fields: [
    { name: 'internalId', type: 'string', required: true, description: 'Internal NetSuite ID', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'itemId', type: 'string', required: true, description: 'Item ID/SKU', canonical_property_uri: `${SCHEMA_NS}sku` },
    { name: 'displayName', type: 'string', required: false, description: 'Display name', canonical_property_uri: `${SCHEMA_NS}name` },
    { name: 'type', type: 'string', required: false, description: 'Item type', canonical_property_uri: null },
    { name: 'basePrice', type: 'number', required: false, description: 'Base price', canonical_property_uri: `${SCHEMA_NS}price` },
    { name: 'quantityAvailable', type: 'number', required: false, description: 'Available quantity', canonical_property_uri: `${SCHEMA_NS}QuantitativeValue` },
    { name: 'isInactive', type: 'boolean', required: false, description: 'Whether item is inactive', canonical_property_uri: null },
  ],
  validation_rules: [
    { rule_id: 'netsuite-items-id-required', description: 'Internal ID must be present', severity: 'warning', constraint: { required: ['internalId'] }, target_fields: ['internalId'] },
    { rule_id: 'netsuite-items-itemid-required', description: 'Item ID must be present', severity: 'warning', constraint: { required: ['itemId'] }, target_fields: ['itemId'] },
  ],
  transformation_template: null, relationships: [],
};

const netsuiteInvoices: VocabularyEntry = {
  connector_type: 'netsuite', sync_entity: 'invoices', version: '1.0.0', last_verified: '2025-01-15T00:00:00.000Z', template_slug: 'netsuite',
  canonical_type_uri: `${SCHEMA_NS}Invoice`, confidence_override: 'curated', confidence_score: 0.85,
  description: 'NetSuite invoices representing billing documents.',
  json_schema: { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object', required: ['internalId', 'tranId'], properties: { internalId: { type: 'string' }, tranId: { type: 'string' }, entity: { type: 'string' }, tranDate: { type: 'string', format: 'date-time' }, status: { type: 'string' }, total: { type: 'number' }, amountPaid: { type: 'number' }, amountRemaining: { type: 'number' } } },
  fields: [
    { name: 'internalId', type: 'string', required: true, description: 'Internal NetSuite ID', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'tranId', type: 'string', required: true, description: 'Transaction ID', canonical_property_uri: `${SCHEMA_NS}confirmationNumber` },
    { name: 'entity', type: 'string', required: false, description: 'Customer entity reference', canonical_property_uri: `${SCHEMA_NS}customer` },
    { name: 'tranDate', type: 'string', required: false, description: 'Transaction date', canonical_property_uri: `${SCHEMA_NS}dateCreated`, format: 'date-time' },
    { name: 'status', type: 'string', required: false, description: 'Invoice status', canonical_property_uri: `${SCHEMA_NS}paymentStatus` },
    { name: 'total', type: 'number', required: false, description: 'Invoice total', canonical_property_uri: `${SCHEMA_NS}totalPaymentDue` },
    { name: 'amountPaid', type: 'number', required: false, description: 'Amount paid', canonical_property_uri: null },
    { name: 'amountRemaining', type: 'number', required: false, description: 'Amount remaining', canonical_property_uri: null },
  ],
  validation_rules: [
    { rule_id: 'netsuite-invoices-id-required', description: 'Internal ID must be present', severity: 'warning', constraint: { required: ['internalId'] }, target_fields: ['internalId'] },
    { rule_id: 'netsuite-invoices-tranid-required', description: 'Transaction ID must be present', severity: 'warning', constraint: { required: ['tranId'] }, target_fields: ['tranId'] },
  ],
  transformation_template: null,
  relationships: [{ source_field: 'entity', target_entity_type: 'customers', relationship_uri: `${SCHEMA_NS}customer`, cardinality: 'one-to-one' }],
};

const netsuiteCustomers: VocabularyEntry = {
  connector_type: 'netsuite', sync_entity: 'customers', version: '1.0.0', last_verified: '2025-01-15T00:00:00.000Z', template_slug: 'netsuite',
  canonical_type_uri: `${SCHEMA_NS}Person`, confidence_override: 'curated', confidence_score: 0.85,
  description: 'NetSuite customers representing business contacts.',
  json_schema: { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object', required: ['internalId', 'entityId'], properties: { internalId: { type: 'string' }, entityId: { type: 'string' }, companyName: { type: 'string' }, email: { type: 'string', format: 'email' }, phone: { type: 'string' }, dateCreated: { type: 'string', format: 'date-time' }, isInactive: { type: 'boolean' } } },
  fields: [
    { name: 'internalId', type: 'string', required: true, description: 'Internal NetSuite ID', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'entityId', type: 'string', required: true, description: 'Entity ID', canonical_property_uri: `${SCHEMA_NS}name` },
    { name: 'companyName', type: 'string', required: false, description: 'Company name', canonical_property_uri: `${SCHEMA_NS}worksFor` },
    { name: 'email', type: 'string', required: false, description: 'Email address', canonical_property_uri: `${SCHEMA_NS}email`, format: 'email' },
    { name: 'phone', type: 'string', required: false, description: 'Phone number', canonical_property_uri: `${SCHEMA_NS}telephone` },
    { name: 'dateCreated', type: 'string', required: false, description: 'Creation date', canonical_property_uri: `${SCHEMA_NS}dateCreated`, format: 'date-time' },
    { name: 'isInactive', type: 'boolean', required: false, description: 'Whether customer is inactive', canonical_property_uri: null },
  ],
  validation_rules: [
    { rule_id: 'netsuite-customers-id-required', description: 'Internal ID must be present', severity: 'warning', constraint: { required: ['internalId'] }, target_fields: ['internalId'] },
    { rule_id: 'netsuite-customers-entityid-required', description: 'Entity ID must be present', severity: 'warning', constraint: { required: ['entityId'] }, target_fields: ['entityId'] },
  ],
  transformation_template: null, relationships: [],
};

export const NETSUITE_ENTRIES: VocabularyEntry[] = [netsuiteItems, netsuiteInvoices, netsuiteCustomers];
