/**
 * BigCommerce Orders Vocabulary Entry (Canonical Source)
 *
 * Community-contributable vocabulary data for BigCommerce orders.
 * Conforms to the VocabularyEntry interface defined in ../../vocabulary-types.ts
 */

import type { VocabularyEntry } from '../../vocabulary-types';

const SCHEMA_NS = 'https://schema.org/';

export const bigcommerceOrders: VocabularyEntry = {
  connector_type: 'bigcommerce',
  sync_entity: 'orders',
  version: '1.0.0',
  last_verified: '2025-01-15T00:00:00.000Z',
  template_slug: 'bigcommerce',
  canonical_type_uri: `${SCHEMA_NS}Order`,
  confidence_override: 'verified',
  confidence_score: 0.95,
  description: 'BigCommerce orders representing customer purchases with line items, pricing, and order status.',
  json_schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['id', 'status', 'date_created', 'total_inc_tax', 'currency_code'],
    properties: {
      id: { type: 'number', description: 'Unique order identifier' },
      status: { type: 'string', description: 'Order status (Incomplete, Pending, Shipped, Partially Shipped, Refunded, Cancelled, Declined, Awaiting Payment, Awaiting Pickup, Awaiting Shipment, Completed, Awaiting Fulfillment, Manual Verification Required, Disputed, Partially Refunded)' },
      date_created: { type: 'string', format: 'date-time', description: 'RFC 2822 timestamp of order creation' },
      total_inc_tax: { type: 'string', description: 'Order total including tax' },
      currency_code: { type: 'string', description: 'Three-letter ISO 4217 currency code' },
      customer_id: { type: 'number', description: 'Customer ID who placed the order (0 for guest)' },
      products: {
        type: 'array',
        description: 'Line items (products) in the order',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            product_id: { type: 'number' },
            name: { type: 'string' },
            quantity: { type: 'number' },
            price_inc_tax: { type: 'string' },
          },
        },
      },
    },
  },
  fields: [
    {
      name: 'id',
      type: 'number',
      required: true,
      description: 'Unique order identifier',
      canonical_property_uri: `${SCHEMA_NS}identifier`,
    },
    {
      name: 'status',
      type: 'string',
      required: true,
      description: 'Order status',
      canonical_property_uri: `${SCHEMA_NS}orderStatus`,
    },
    {
      name: 'date_created',
      type: 'string',
      required: true,
      description: 'RFC 2822 timestamp of order creation',
      canonical_property_uri: `${SCHEMA_NS}orderDate`,
      format: 'date-time',
    },
    {
      name: 'total_inc_tax',
      type: 'string',
      required: true,
      description: 'Order total including tax',
      canonical_property_uri: `${SCHEMA_NS}totalPrice`,
    },
    {
      name: 'currency_code',
      type: 'string',
      required: true,
      description: 'Three-letter ISO 4217 currency code',
      canonical_property_uri: `${SCHEMA_NS}priceCurrency`,
    },
    {
      name: 'customer_id',
      type: 'number',
      required: false,
      description: 'Customer ID who placed the order (0 for guest)',
      canonical_property_uri: `${SCHEMA_NS}customer`,
    },
    {
      name: 'products',
      type: 'array',
      required: false,
      description: 'Line items (products) in the order',
      canonical_property_uri: `${SCHEMA_NS}orderedItem`,
    },
  ],
  validation_rules: [
    {
      rule_id: 'bigcommerce-orders-id-required',
      description: 'Order ID must be present',
      severity: 'warning',
      constraint: { required: ['id'] },
      target_fields: ['id'],
    },
    {
      rule_id: 'bigcommerce-orders-status-required',
      description: 'Order status must be present',
      severity: 'warning',
      constraint: { required: ['status'] },
      target_fields: ['status'],
    },
    {
      rule_id: 'bigcommerce-orders-date-created-format',
      description: 'date_created must be a valid ISO 8601 date-time',
      severity: 'warning',
      constraint: { properties: { date_created: { format: 'date-time' } } },
      target_fields: ['date_created'],
    },
    {
      rule_id: 'bigcommerce-orders-total-inc-tax-required',
      description: 'total_inc_tax must be present',
      severity: 'warning',
      constraint: { required: ['total_inc_tax'] },
      target_fields: ['total_inc_tax'],
    },
  ],
  transformation_template: {
    steps: [
      {
        order: 0,
        transform_type: 'rename-field',
        operation_config: {
          mappings: {
            status: 'orderStatus',
            date_created: 'orderDate',
            total_inc_tax: 'totalPrice',
            currency_code: 'priceCurrency',
            customer_id: 'customerId',
            products: 'orderedItems',
          },
        },
        description: 'Rename BigCommerce order fields to schema.org canonical property names',
      },
      {
        order: 1,
        transform_type: 'format-timestamp',
        operation_config: {
          fields: ['orderDate'],
          input_format: 'RFC2822',
          output_format: 'ISO8601',
        },
        description: 'Convert orderDate from RFC 2822 to ISO 8601 format',
      },
      {
        order: 2,
        transform_type: 'select-fields',
        operation_config: {
          fields: [
            'id',
            'orderStatus',
            'orderDate',
            'totalPrice',
            'priceCurrency',
            'customerId',
            'orderedItems',
          ],
        },
        description: 'Select only mapped fields for the canonical output',
      },
    ],
    sample_input: [
      {
        id: 100,
        status: 'Completed',
        date_created: 'Wed, 15 Jan 2025 10:30:00 +0000',
        total_inc_tax: '125.50',
        currency_code: 'USD',
        customer_id: 5,
        products: [
          { id: 1, product_id: 77, name: 'Classic T-Shirt', quantity: 2, price_inc_tax: '49.98' },
          { id: 2, product_id: 88, name: 'Baseball Cap', quantity: 1, price_inc_tax: '25.52' },
        ],
      },
      {
        id: 101,
        status: 'Awaiting Shipment',
        date_created: 'Thu, 16 Jan 2025 14:00:00 +0000',
        total_inc_tax: '299.99',
        currency_code: 'USD',
        customer_id: 12,
        products: [
          { id: 3, product_id: 55, name: 'Running Shoes', quantity: 1, price_inc_tax: '299.99' },
        ],
      },
      {
        id: 102,
        status: 'Pending',
        date_created: 'Fri, 17 Jan 2025 08:15:00 +0000',
        total_inc_tax: '45.00',
        currency_code: 'GBP',
        customer_id: 0,
        products: [
          { id: 4, product_id: 120, name: 'Scented Candle Set', quantity: 3, price_inc_tax: '45.00' },
        ],
      },
    ],
    expected_output: [
      {
        id: 100,
        orderStatus: 'Completed',
        orderDate: '2025-01-15T10:30:00.000Z',
        totalPrice: '125.50',
        priceCurrency: 'USD',
        customerId: 5,
        orderedItems: [
          { id: 1, product_id: 77, name: 'Classic T-Shirt', quantity: 2, price_inc_tax: '49.98' },
          { id: 2, product_id: 88, name: 'Baseball Cap', quantity: 1, price_inc_tax: '25.52' },
        ],
      },
      {
        id: 101,
        orderStatus: 'Awaiting Shipment',
        orderDate: '2025-01-16T14:00:00.000Z',
        totalPrice: '299.99',
        priceCurrency: 'USD',
        customerId: 12,
        orderedItems: [
          { id: 3, product_id: 55, name: 'Running Shoes', quantity: 1, price_inc_tax: '299.99' },
        ],
      },
      {
        id: 102,
        orderStatus: 'Pending',
        orderDate: '2025-01-17T08:15:00.000Z',
        totalPrice: '45.00',
        priceCurrency: 'GBP',
        customerId: 0,
        orderedItems: [
          { id: 4, product_id: 120, name: 'Scented Candle Set', quantity: 3, price_inc_tax: '45.00' },
        ],
      },
    ],
  },
  relationships: [
    {
      source_field: 'customer_id',
      target_entity_type: 'customers',
      relationship_uri: `${SCHEMA_NS}customer`,
      cardinality: 'one-to-one',
    },
  ],
};
