/**
 * Stripe Vocabulary Entries (Canonical Source)
 *
 * Community-contributable vocabulary data for Stripe connector entities:
 * charges, payment_intents, refunds, customers, subscriptions, invoices.
 *
 * This file is the canonical source of truth for Stripe vocabulary data.
 * The runtime logic (types, registry, lookup) lives in platform-backend.
 *
 * Key Stripe-specific detail: amounts are in cents (integer). Transformation
 * templates include a derived-columns step to convert cents to dollars (divide by 100).
 *
 * Shape: Each entry conforms to the VocabularyEntry interface defined in
 * platform-backend/graph/lib/ontology/vocabulary/types.ts
 */

const SCHEMA_NS = 'https://schema.org/';

// ─── Charges ─────────────────────────────────────────────────────────────────

const stripeCharges = {
  connector_type: 'stripe',
  sync_entity: 'charges',
  version: '1.0.0',
  last_verified: '2025-01-15T00:00:00.000Z',
  template_slug: 'stripe',
  canonical_type_uri: `${SCHEMA_NS}PayAction`,
  confidence_override: 'verified',
  confidence_score: 0.95,
  description: 'Stripe charges representing completed or attempted payment transactions.',
  json_schema: { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object', required: ['id', 'amount', 'currency', 'status', 'created'], properties: { id: { type: 'string', description: 'Unique charge identifier (ch_xxx)' }, amount: { type: 'number', description: 'Charge amount in cents' }, currency: { type: 'string', description: 'Three-letter ISO 4217 currency code' }, status: { type: 'string', description: 'Charge status (succeeded, pending, failed)' }, customer: { type: 'string', description: 'Customer ID associated with the charge (cus_xxx)' }, created: { type: 'number', description: 'Unix timestamp of charge creation' }, payment_method: { type: 'string', description: 'Payment method ID used (pm_xxx)' } } },
  fields: [
    { name: 'id', type: 'string', required: true, description: 'Unique charge identifier (ch_xxx)', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'amount', type: 'number', required: true, description: 'Charge amount in cents', canonical_property_uri: `${SCHEMA_NS}price` },
    { name: 'currency', type: 'string', required: true, description: 'Three-letter ISO 4217 currency code', canonical_property_uri: `${SCHEMA_NS}priceCurrency` },
    { name: 'status', type: 'string', required: true, description: 'Charge status (succeeded, pending, failed)', canonical_property_uri: `${SCHEMA_NS}actionStatus` },
    { name: 'customer', type: 'string', required: false, description: 'Customer ID associated with the charge (cus_xxx)', canonical_property_uri: `${SCHEMA_NS}agent` },
    { name: 'created', type: 'number', required: true, description: 'Unix timestamp of charge creation', canonical_property_uri: `${SCHEMA_NS}startTime` },
    { name: 'payment_method', type: 'string', required: false, description: 'Payment method ID used (pm_xxx)', canonical_property_uri: `${SCHEMA_NS}paymentMethod` },
  ],
  validation_rules: [
    { rule_id: 'stripe-charges-id-required', description: 'Charge ID must be present', severity: 'warning', constraint: { required: ['id'] }, target_fields: ['id'] },
    { rule_id: 'stripe-charges-amount-required', description: 'Charge amount must be present', severity: 'warning', constraint: { required: ['amount'] }, target_fields: ['amount'] },
    { rule_id: 'stripe-charges-amount-type', description: 'Charge amount must be a number (integer cents)', severity: 'warning', constraint: { properties: { amount: { type: 'number' } } }, target_fields: ['amount'] },
    { rule_id: 'stripe-charges-status-required', description: 'Charge status must be present', severity: 'warning', constraint: { required: ['status'] }, target_fields: ['status'] },
  ],
  transformation_template: {
    steps: [
      { order: 0, transform_type: 'derived-columns', operation_config: { columns: [{ name: 'amount_dollars', expression: 'amount / 100', description: 'Convert amount from cents to dollars' }] }, description: 'Convert Stripe amount from cents to dollars' },
      { order: 1, transform_type: 'rename-field', operation_config: { mappings: { amount_dollars: 'price', currency: 'priceCurrency', status: 'actionStatus', created: 'startTime', payment_method: 'paymentMethod' } }, description: 'Rename Stripe charge fields to schema.org canonical property names' },
      { order: 2, transform_type: 'select-fields', operation_config: { fields: ['id', 'price', 'priceCurrency', 'actionStatus', 'customer', 'startTime', 'paymentMethod'] }, description: 'Select only mapped fields for the canonical output' },
    ],
