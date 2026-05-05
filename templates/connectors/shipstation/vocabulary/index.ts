/**
 * ShipStation Vocabulary Entries (Canonical Source — Mapping Only)
 */
import type { VocabularyEntry } from '../../vocabulary-types';

const SCHEMA_NS = 'https://schema.org/';

const shipstationShipments: VocabularyEntry = {
  connector_type: 'shipstation', sync_entity: 'shipments', version: '1.0.0', last_verified: '2025-01-15T00:00:00.000Z', template_slug: 'shipstation',
  canonical_type_uri: `${SCHEMA_NS}ParcelDelivery`, confidence_override: 'curated', confidence_score: 0.85,
  description: 'ShipStation shipments representing fulfilled deliveries.',
  json_schema: { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object', required: ['shipmentId', 'orderId'], properties: { shipmentId: { type: 'number' }, orderId: { type: 'number' }, trackingNumber: { type: 'string' }, carrierCode: { type: 'string' }, shipDate: { type: 'string', format: 'date-time' }, deliveryDate: { type: 'string', format: 'date-time' }, shipmentCost: { type: 'number' } } },
  fields: [
    { name: 'shipmentId', type: 'number', required: true, description: 'Unique shipment identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'orderId', type: 'number', required: true, description: 'Associated order ID', canonical_property_uri: null },
    { name: 'trackingNumber', type: 'string', required: false, description: 'Tracking number', canonical_property_uri: `${SCHEMA_NS}trackingNumber` },
    { name: 'carrierCode', type: 'string', required: false, description: 'Carrier code', canonical_property_uri: `${SCHEMA_NS}deliveryMethod` },
    { name: 'shipDate', type: 'string', required: false, description: 'Ship date', canonical_property_uri: `${SCHEMA_NS}expectedArrivalFrom`, format: 'date-time' },
    { name: 'deliveryDate', type: 'string', required: false, description: 'Delivery date', canonical_property_uri: `${SCHEMA_NS}expectedArrivalUntil`, format: 'date-time' },
    { name: 'shipmentCost', type: 'number', required: false, description: 'Shipment cost', canonical_property_uri: `${SCHEMA_NS}price` },
  ],
  validation_rules: [
    { rule_id: 'shipstation-shipments-id-required', description: 'Shipment ID must be present', severity: 'warning', constraint: { required: ['shipmentId'] }, target_fields: ['shipmentId'] },
    { rule_id: 'shipstation-shipments-order-required', description: 'Order ID must be present', severity: 'warning', constraint: { required: ['orderId'] }, target_fields: ['orderId'] },
  ],
  transformation_template: null,
  relationships: [{ source_field: 'orderId', target_entity_type: 'orders', relationship_uri: `${SCHEMA_NS}partOfOrder`, cardinality: 'one-to-one' }],
};

const shipstationOrders: VocabularyEntry = {
  connector_type: 'shipstation', sync_entity: 'orders', version: '1.0.0', last_verified: '2025-01-15T00:00:00.000Z', template_slug: 'shipstation',
  canonical_type_uri: `${SCHEMA_NS}Order`, confidence_override: 'curated', confidence_score: 0.85,
  description: 'ShipStation orders representing fulfillment requests.',
  json_schema: { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object', required: ['orderId', 'orderNumber'], properties: { orderId: { type: 'number' }, orderNumber: { type: 'string' }, orderDate: { type: 'string', format: 'date-time' }, orderStatus: { type: 'string' }, orderTotal: { type: 'number' }, customerEmail: { type: 'string', format: 'email' }, items: { type: 'array' } } },
  fields: [
    { name: 'orderId', type: 'number', required: true, description: 'Unique order identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'orderNumber', type: 'string', required: true, description: 'Order number', canonical_property_uri: `${SCHEMA_NS}orderNumber` },
    { name: 'orderDate', type: 'string', required: false, description: 'Order date', canonical_property_uri: `${SCHEMA_NS}orderDate`, format: 'date-time' },
    { name: 'orderStatus', type: 'string', required: false, description: 'Order status', canonical_property_uri: `${SCHEMA_NS}orderStatus` },
    { name: 'orderTotal', type: 'number', required: false, description: 'Order total', canonical_property_uri: `${SCHEMA_NS}totalPrice` },
    { name: 'customerEmail', type: 'string', required: false, description: 'Customer email', canonical_property_uri: `${SCHEMA_NS}email`, format: 'email' },
    { name: 'items', type: 'array', required: false, description: 'Order line items', canonical_property_uri: `${SCHEMA_NS}orderedItem` },
  ],
  validation_rules: [
    { rule_id: 'shipstation-orders-id-required', description: 'Order ID must be present', severity: 'warning', constraint: { required: ['orderId'] }, target_fields: ['orderId'] },
    { rule_id: 'shipstation-orders-number-required', description: 'Order number must be present', severity: 'warning', constraint: { required: ['orderNumber'] }, target_fields: ['orderNumber'] },
  ],
  transformation_template: null, relationships: [],
};

export const SHIPSTATION_ENTRIES: VocabularyEntry[] = [shipstationShipments, shipstationOrders];
