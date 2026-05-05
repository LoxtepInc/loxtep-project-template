/**
 * PayPal Vocabulary Entries (Canonical Source — Mapping Only)
 */
import type { VocabularyEntry } from '../../vocabulary-types';

const SCHEMA_NS = 'https://schema.org/';

const paypalPayments: VocabularyEntry = {
  connector_type: 'paypal', sync_entity: 'payments', version: '1.0.0', last_verified: '2025-01-15T00:00:00.000Z', template_slug: 'paypal',
  canonical_type_uri: `${SCHEMA_NS}PayAction`, confidence_override: 'curated', confidence_score: 0.85,
  description: 'PayPal payments representing payment transactions.',
  json_schema: { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object', required: ['id', 'intent', 'state'], properties: { id: { type: 'string' }, intent: { type: 'string' }, state: { type: 'string' }, create_time: { type: 'string', format: 'date-time' }, update_time: { type: 'string', format: 'date-time' }, payer: { type: 'object' }, transactions: { type: 'array' } } },
  fields: [
    { name: 'id', type: 'string', required: true, description: 'Payment identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'intent', type: 'string', required: true, description: 'Payment intent (sale, authorize, order)', canonical_property_uri: null },
    { name: 'state', type: 'string', required: true, description: 'Payment state', canonical_property_uri: `${SCHEMA_NS}actionStatus` },
    { name: 'create_time', type: 'string', required: false, description: 'Creation timestamp', canonical_property_uri: `${SCHEMA_NS}startTime`, format: 'date-time' },
    { name: 'update_time', type: 'string', required: false, description: 'Last update timestamp', canonical_property_uri: `${SCHEMA_NS}dateModified`, format: 'date-time' },
    { name: 'payer', type: 'object', required: false, description: 'Payer information', canonical_property_uri: `${SCHEMA_NS}agent` },
    { name: 'transactions', type: 'array', required: false, description: 'Transaction details', canonical_property_uri: `${SCHEMA_NS}object` },
  ],
  validation_rules: [
    { rule_id: 'paypal-payments-id-required', description: 'Payment ID must be present', severity: 'warning', constraint: { required: ['id'] }, target_fields: ['id'] },
    { rule_id: 'paypal-payments-state-required', description: 'Payment state must be present', severity: 'warning', constraint: { required: ['state'] }, target_fields: ['state'] },
  ],
  transformation_template: null, relationships: [],
};

const paypalTransactions: VocabularyEntry = {
  connector_type: 'paypal', sync_entity: 'transactions', version: '1.0.0', last_verified: '2025-01-15T00:00:00.000Z', template_slug: 'paypal',
  canonical_type_uri: `${SCHEMA_NS}MoneyTransfer`, confidence_override: 'curated', confidence_score: 0.85,
  description: 'PayPal transactions representing money movements.',
  json_schema: { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object', required: ['transaction_id', 'transaction_type'], properties: { transaction_id: { type: 'string' }, transaction_type: { type: 'string' }, transaction_status: { type: 'string' }, gross_amount: { type: 'string' }, fee_amount: { type: 'string' }, net_amount: { type: 'string' }, transaction_date: { type: 'string', format: 'date-time' } } },
  fields: [
    { name: 'transaction_id', type: 'string', required: true, description: 'Transaction identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'transaction_type', type: 'string', required: true, description: 'Transaction type', canonical_property_uri: `${SCHEMA_NS}name` },
    { name: 'transaction_status', type: 'string', required: false, description: 'Transaction status', canonical_property_uri: `${SCHEMA_NS}actionStatus` },
    { name: 'gross_amount', type: 'string', required: false, description: 'Gross amount', canonical_property_uri: `${SCHEMA_NS}price` },
    { name: 'fee_amount', type: 'string', required: false, description: 'Fee amount', canonical_property_uri: null },
    { name: 'net_amount', type: 'string', required: false, description: 'Net amount', canonical_property_uri: null },
    { name: 'transaction_date', type: 'string', required: false, description: 'Transaction date', canonical_property_uri: `${SCHEMA_NS}startTime`, format: 'date-time' },
  ],
  validation_rules: [
    { rule_id: 'paypal-transactions-id-required', description: 'Transaction ID must be present', severity: 'warning', constraint: { required: ['transaction_id'] }, target_fields: ['transaction_id'] },
    { rule_id: 'paypal-transactions-type-required', description: 'Transaction type must be present', severity: 'warning', constraint: { required: ['transaction_type'] }, target_fields: ['transaction_type'] },
  ],
  transformation_template: null, relationships: [],
};

export const PAYPAL_ENTRIES: VocabularyEntry[] = [paypalPayments, paypalTransactions];
