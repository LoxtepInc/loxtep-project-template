/**
 * Shopify Vocabulary Entries (Canonical Source)
 *
 * Community-contributable vocabulary data for Shopify connector entities:
 * orders, products, customers.
 *
 * This file is the canonical source of truth for Shopify vocabulary data.
 * The runtime logic (types, registry, lookup) lives in platform-backend.
 *
 * Shape: Each entry conforms to the VocabularyEntry interface defined in
 * platform-backend/graph/lib/ontology/vocabulary/types.ts
 */

const SCHEMA_NS = 'https://schema.org/';

// ─── Orders ──────────────────────────────────────────────────────────────────

const shopifyOrders = {
  connector_type: 'shopify',
  sync_entity: 'orders',
  version: '1.0.0',
  last_verified: '2025-01-15T00:00:00.000Z',
  template_slug: 'shopify',
  canonical_type_uri: `${SCHEMA_NS}Order`,
  confidence_override: 'verified',
  confidence_score: 0.95,
  description: 'Shopify orders representing customer purchases with line items, pricing, and fulfillment status.',
  json_schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['id', 'order_number', 'created_at', 'financial_status', 'total_price'],
    properties: {
      id: { type: 'number', description: 'Unique order identifier' },
      order_number: { type: 'number', description: 'Sequential order number displayed to merchant' },
      created_at: { type: 'string', format: 'date-time', description: 'ISO 8601 timestamp of order creation' },
      financial_status: { type: 'string', description: 'Payment status (paid, pending, refunded, etc.)' },
      total_price: { type: 'string', description: 'Total price of the order including taxes and discounts' },
      currency: { type: 'string', description: 'Three-letter ISO 4217 currency code' },
      customer: {
        type: 'object',
        description: 'Customer who placed the order',
        properties: { id: { type: 'number' }, email: { type: 'string', format: 'email' }, first_name: { type: 'string' }, last_name: { type: 'string' } },
      },
      line_items: {
        type: 'array',
        description: 'List of line items in the order',
        items: { type: 'object', properties: { id: { type: 'number' }, product_id: { type: 'number' }, title: { type: 'string' }, quantity: { type: 'number' }, price: { type: 'string' } } },
      },
    },
  },
  fields: [
    { name: 'id', type: 'number', required: true, description: 'Unique order identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'order_number', type: 'number', required: true, description: 'Sequential order number displayed to merchant', canonical_property_uri: `${SCHEMA_NS}orderNumber` },
    { name: 'created_at', type: 'string', required: true, description: 'ISO 8601 timestamp of order creation', canonical_property_uri: `${SCHEMA_NS}orderDate`, format: 'date-time' },
    { name: 'financial_status', type: 'string', required: true, description: 'Payment status (paid, pending, refunded, etc.)', canonical_property_uri: `${SCHEMA_NS}orderStatus` },
    { name: 'total_price', type: 'string', required: true, description: 'Total price of the order including taxes and discounts', canonical_property_uri: `${SCHEMA_NS}totalPrice` },
    { name: 'currency', type: 'string', required: false, description: 'Three-letter ISO 4217 currency code', canonical_property_uri: null },
    { name: 'customer', type: 'object', required: false, description: 'Customer who placed the order', canonical_property_uri: `${SCHEMA_NS}customer` },
    { name: 'line_items', type: 'array', required: false, description: 'List of line items in the order', canonical_property_uri: `${SCHEMA_NS}orderedItem` },
  ],
  validation_rules: [
    { rule_id: 'shopify-orders-id-required', description: 'Order ID must be present', severity: 'warning', constraint: { required: ['id'] }, target_fields: ['id'] },
    { rule_id: 'shopify-orders-order-number-required', description: 'Order number must be present', severity: 'warning', constraint: { required: ['order_number'] }, target_fields: ['order_number'] },
    { rule_id: 'shopify-orders-created-at-format', description: 'created_at must be a valid ISO 8601 date-time', severity: 'warning', constraint: { properties: { created_at: { format: 'date-time' } } }, target_fields: ['created_at'] },
    { rule_id: 'shopify-orders-total-price-type', description: 'total_price must be a string representing a decimal number', severity: 'warning', constraint: { properties: { total_price: { type: 'string' } } }, target_fields: ['total_price'] },
  ],
  transformation_template: {
    steps: [
      { order: 0, transform_type: 'rename-field', operation_config: { mappings: { order_number: 'orderNumber', created_at: 'orderDate', financial_status: 'orderStatus', total_price: 'totalPrice' } }, description: 'Rename Shopify order fields to schema.org canonical property names' },
      { order: 1, transform_type: 'format-timestamp', operation_config: { fields: ['orderDate'], input_format: 'ISO8601', output_format: 'ISO8601' }, description: 'Normalize orderDate timestamp to consistent ISO 8601 format' },
      { order: 2, transform_type: 'flatten', operation_config: { field: 'customer', prefix: 'customer_', fields_to_extract: ['id', 'email', 'first_name', 'last_name'] }, description: 'Flatten nested customer object into top-level fields with customer_ prefix' },
      { order: 3, transform_type: 'select-fields', operation_config: { fields: ['id', 'orderNumber', 'orderDate', 'orderStatus', 'totalPrice', 'currency', 'customer_id', 'customer_email', 'customer_first_name', 'customer_last_name', 'line_items'] }, description: 'Select only mapped fields for the canonical output' },
    ],
    sample_input: [
      { id: 5012345678901, order_number: 1042, created_at: '2025-01-10T14:30:00-05:00', financial_status: 'paid', total_price: '129.99', currency: 'USD', customer: { id: 6012345678901, email: 'jane@example.com', first_name: 'Jane', last_name: 'Doe' }, line_items: [{ id: 11012345678901, product_id: 7012345678901, title: 'Organic Cotton T-Shirt', quantity: 2, price: '49.99' }, { id: 11012345678902, product_id: 7012345678902, title: 'Recycled Tote Bag', quantity: 1, price: '30.01' }] },
      { id: 5012345678902, order_number: 1043, created_at: '2025-01-11T09:15:00-05:00', financial_status: 'pending', total_price: '59.00', currency: 'USD', customer: { id: 6012345678902, email: 'john@example.com', first_name: 'John', last_name: 'Smith' }, line_items: [{ id: 11012345678903, product_id: 7012345678903, title: 'Bamboo Water Bottle', quantity: 1, price: '59.00' }] },
      { id: 5012345678903, order_number: 1044, created_at: '2025-01-12T16:45:00-05:00', financial_status: 'refunded', total_price: '249.50', currency: 'CAD', customer: { id: 6012345678903, email: 'alex@example.com', first_name: 'Alex', last_name: 'Johnson' }, line_items: [{ id: 11012345678904, product_id: 7012345678904, title: 'Merino Wool Sweater', quantity: 1, price: '189.50' }, { id: 11012345678905, product_id: 7012345678905, title: 'Silk Scarf', quantity: 1, price: '60.00' }] },
    ],
    expected_output: [
      { id: 5012345678901, orderNumber: 1042, orderDate: '2025-01-10T14:30:00-05:00', orderStatus: 'paid', totalPrice: '129.99', currency: 'USD', customer_id: 6012345678901, customer_email: 'jane@example.com', customer_first_name: 'Jane', customer_last_name: 'Doe', line_items: [{ id: 11012345678901, product_id: 7012345678901, title: 'Organic Cotton T-Shirt', quantity: 2, price: '49.99' }, { id: 11012345678902, product_id: 7012345678902, title: 'Recycled Tote Bag', quantity: 1, price: '30.01' }] },
      { id: 5012345678902, orderNumber: 1043, orderDate: '2025-01-11T09:15:00-05:00', orderStatus: 'pending', totalPrice: '59.00', currency: 'USD', customer_id: 6012345678902, customer_email: 'john@example.com', customer_first_name: 'John', customer_last_name: 'Smith', line_items: [{ id: 11012345678903, product_id: 7012345678903, title: 'Bamboo Water Bottle', quantity: 1, price: '59.00' }] },
      { id: 5012345678903, orderNumber: 1044, orderDate: '2025-01-12T16:45:00-05:00', orderStatus: 'refunded', totalPrice: '249.50', currency: 'CAD', customer_id: 6012345678903, customer_email: 'alex@example.com', customer_first_name: 'Alex', customer_last_name: 'Johnson', line_items: [{ id: 11012345678904, product_id: 7012345678904, title: 'Merino Wool Sweater', quantity: 1, price: '189.50' }, { id: 11012345678905, product_id: 7012345678905, title: 'Silk Scarf', quantity: 1, price: '60.00' }] },
    ],
  },
  relationships: [
    { source_field: 'customer', target_entity_type: 'customers', relationship_uri: `${SCHEMA_NS}customer`, cardinality: 'one-to-one' },
    { source_field: 'line_items', target_entity_type: 'products', relationship_uri: `${SCHEMA_NS}orderedItem`, cardinality: 'one-to-many' },
  ],
};

// ─── Products ────────────────────────────────────────────────────────────────

const shopifyProducts = {
  connector_type: 'shopify',
  sync_entity: 'products',
  version: '1.0.0',
  last_verified: '2025-01-15T00:00:00.000Z',
  template_slug: 'shopify',
  canonical_type_uri: `${SCHEMA_NS}Product`,
  confidence_override: 'verified',
  confidence_score: 0.95,
  description: 'Shopify products representing items available for sale with variants, pricing, and inventory.',
  json_schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['id', 'title', 'vendor'],
    properties: {
      id: { type: 'number', description: 'Unique product identifier' },
      title: { type: 'string', description: 'Product title' },
      vendor: { type: 'string', description: 'Product vendor or brand name' },
      product_type: { type: 'string', description: 'Product category type' },
      created_at: { type: 'string', format: 'date-time', description: 'ISO 8601 timestamp of product creation' },
      updated_at: { type: 'string', format: 'date-time', description: 'ISO 8601 timestamp of last update' },
      status: { type: 'string', description: 'Product status (active, draft, archived)' },
      variants: { type: 'array', description: 'Product variants with pricing and inventory', items: { type: 'object', properties: { id: { type: 'number' }, title: { type: 'string' }, price: { type: 'string' }, sku: { type: 'string' }, inventory_quantity: { type: 'number' } } } },
      inventory_quantity: { type: 'number', description: 'Total inventory quantity across all variants' },
    },
  },
  fields: [
    { name: 'id', type: 'number', required: true, description: 'Unique product identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'title', type: 'string', required: true, description: 'Product title', canonical_property_uri: `${SCHEMA_NS}name` },
    { name: 'vendor', type: 'string', required: true, description: 'Product vendor or brand name', canonical_property_uri: `${SCHEMA_NS}brand` },
    { name: 'product_type', type: 'string', required: false, description: 'Product category type', canonical_property_uri: null },
    { name: 'created_at', type: 'string', required: false, description: 'ISO 8601 timestamp of product creation', canonical_property_uri: null, format: 'date-time' },
    { name: 'updated_at', type: 'string', required: false, description: 'ISO 8601 timestamp of last update', canonical_property_uri: null, format: 'date-time' },
    { name: 'status', type: 'string', required: false, description: 'Product status (active, draft, archived)', canonical_property_uri: null },
    { name: 'variants', type: 'array', required: false, description: 'Product variants with pricing and inventory', canonical_property_uri: `${SCHEMA_NS}offers` },
    { name: 'inventory_quantity', type: 'number', required: false, description: 'Total inventory quantity across all variants', canonical_property_uri: `${SCHEMA_NS}QuantitativeValue` },
  ],
  validation_rules: [
    { rule_id: 'shopify-products-id-required', description: 'Product ID must be present', severity: 'warning', constraint: { required: ['id'] }, target_fields: ['id'] },
    { rule_id: 'shopify-products-title-required', description: 'Product title must be present', severity: 'warning', constraint: { required: ['title'] }, target_fields: ['title'] },
    { rule_id: 'shopify-products-vendor-required', description: 'Product vendor must be present', severity: 'warning', constraint: { required: ['vendor'] }, target_fields: ['vendor'] },
    { rule_id: 'shopify-products-created-at-format', description: 'created_at must be a valid ISO 8601 date-time', severity: 'warning', constraint: { properties: { created_at: { format: 'date-time' } } }, target_fields: ['created_at'] },
  ],
  transformation_template: {
    steps: [
      { order: 0, transform_type: 'rename-field', operation_config: { mappings: { title: 'name', vendor: 'brand', variants: 'offers', inventory_quantity: 'quantitativeValue' } }, description: 'Rename Shopify product fields to schema.org canonical property names' },
      { order: 1, transform_type: 'format-timestamp', operation_config: { fields: ['created_at', 'updated_at'], input_format: 'ISO8601', output_format: 'ISO8601' }, description: 'Normalize product timestamps to consistent ISO 8601 format' },
      { order: 2, transform_type: 'select-fields', operation_config: { fields: ['id', 'name', 'brand', 'product_type', 'created_at', 'updated_at', 'status', 'offers', 'quantitativeValue'] }, description: 'Select only mapped fields for the canonical output' },
    ],
    sample_input: [
      { id: 7012345678901, title: 'Organic Cotton T-Shirt', vendor: 'EcoWear', product_type: 'Apparel', created_at: '2024-11-01T10:00:00-05:00', updated_at: '2025-01-05T08:30:00-05:00', status: 'active', variants: [{ id: 40012345678901, title: 'Small / White', price: '49.99', sku: 'ECO-TS-SW', inventory_quantity: 25 }, { id: 40012345678902, title: 'Medium / White', price: '49.99', sku: 'ECO-TS-MW', inventory_quantity: 30 }], inventory_quantity: 55 },
      { id: 7012345678902, title: 'Recycled Tote Bag', vendor: 'GreenCarry', product_type: 'Accessories', created_at: '2024-12-15T14:00:00-05:00', updated_at: '2025-01-08T11:00:00-05:00', status: 'active', variants: [{ id: 40012345678903, title: 'Natural', price: '30.01', sku: 'GC-TOTE-N', inventory_quantity: 100 }], inventory_quantity: 100 },
      { id: 7012345678903, title: 'Bamboo Water Bottle', vendor: 'HydroNature', product_type: 'Drinkware', created_at: '2024-10-20T09:00:00-05:00', updated_at: '2025-01-10T16:00:00-05:00', status: 'draft', variants: [{ id: 40012345678904, title: '500ml', price: '39.00', sku: 'HN-BWB-500', inventory_quantity: 0 }, { id: 40012345678905, title: '750ml', price: '59.00', sku: 'HN-BWB-750', inventory_quantity: 12 }], inventory_quantity: 12 },
    ],
    expected_output: [
      { id: 7012345678901, name: 'Organic Cotton T-Shirt', brand: 'EcoWear', product_type: 'Apparel', created_at: '2024-11-01T10:00:00-05:00', updated_at: '2025-01-05T08:30:00-05:00', status: 'active', offers: [{ id: 40012345678901, title: 'Small / White', price: '49.99', sku: 'ECO-TS-SW', inventory_quantity: 25 }, { id: 40012345678902, title: 'Medium / White', price: '49.99', sku: 'ECO-TS-MW', inventory_quantity: 30 }], quantitativeValue: 55 },
      { id: 7012345678902, name: 'Recycled Tote Bag', brand: 'GreenCarry', product_type: 'Accessories', created_at: '2024-12-15T14:00:00-05:00', updated_at: '2025-01-08T11:00:00-05:00', status: 'active', offers: [{ id: 40012345678903, title: 'Natural', price: '30.01', sku: 'GC-TOTE-N', inventory_quantity: 100 }], quantitativeValue: 100 },
      { id: 7012345678903, name: 'Bamboo Water Bottle', brand: 'HydroNature', product_type: 'Drinkware', created_at: '2024-10-20T09:00:00-05:00', updated_at: '2025-01-10T16:00:00-05:00', status: 'draft', offers: [{ id: 40012345678904, title: '500ml', price: '39.00', sku: 'HN-BWB-500', inventory_quantity: 0 }, { id: 40012345678905, title: '750ml', price: '59.00', sku: 'HN-BWB-750', inventory_quantity: 12 }], quantitativeValue: 12 },
    ],
  },
  relationships: [],
};

// ─── Customers ───────────────────────────────────────────────────────────────

const shopifyCustomers = {
  connector_type: 'shopify',
  sync_entity: 'customers',
  version: '1.0.0',
  last_verified: '2025-01-15T00:00:00.000Z',
  template_slug: 'shopify',
  canonical_type_uri: `${SCHEMA_NS}Person`,
  confidence_override: 'verified',
  confidence_score: 0.95,
  description: 'Shopify customers representing individuals who have placed orders or created accounts.',
  json_schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['id', 'email', 'first_name', 'last_name'],
    properties: {
      id: { type: 'number', description: 'Unique customer identifier' },
      email: { type: 'string', format: 'email', description: 'Customer email address' },
      first_name: { type: 'string', description: 'Customer first name' },
      last_name: { type: 'string', description: 'Customer last name' },
      phone: { type: 'string', description: 'Customer phone number' },
      created_at: { type: 'string', format: 'date-time', description: 'ISO 8601 timestamp of customer creation' },
      updated_at: { type: 'string', format: 'date-time', description: 'ISO 8601 timestamp of last update' },
      orders_count: { type: 'number', description: 'Total number of orders placed by customer' },
      total_spent: { type: 'string', description: 'Total amount spent by customer' },
      verified_email: { type: 'boolean', description: 'Whether the customer email has been verified' },
      default_address: { type: 'object', description: 'Customer default shipping address', properties: { address1: { type: 'string' }, city: { type: 'string' }, province: { type: 'string' }, country: { type: 'string' }, zip: { type: 'string' } } },
    },
  },
  fields: [
    { name: 'id', type: 'number', required: true, description: 'Unique customer identifier', canonical_property_uri: `${SCHEMA_NS}identifier` },
    { name: 'email', type: 'string', required: true, description: 'Customer email address', canonical_property_uri: `${SCHEMA_NS}email`, format: 'email' },
    { name: 'first_name', type: 'string', required: true, description: 'Customer first name', canonical_property_uri: `${SCHEMA_NS}givenName` },
    { name: 'last_name', type: 'string', required: true, description: 'Customer last name', canonical_property_uri: `${SCHEMA_NS}familyName` },
    { name: 'phone', type: 'string', required: false, description: 'Customer phone number', canonical_property_uri: null },
    { name: 'created_at', type: 'string', required: false, description: 'ISO 8601 timestamp of customer creation', canonical_property_uri: null, format: 'date-time' },
    { name: 'updated_at', type: 'string', required: false, description: 'ISO 8601 timestamp of last update', canonical_property_uri: null, format: 'date-time' },
    { name: 'orders_count', type: 'number', required: false, description: 'Total number of orders placed by customer', canonical_property_uri: null },
    { name: 'total_spent', type: 'string', required: false, description: 'Total amount spent by customer', canonical_property_uri: null },
    { name: 'verified_email', type: 'boolean', required: false, description: 'Whether the customer email has been verified', canonical_property_uri: null },
    { name: 'default_address', type: 'object', required: false, description: 'Customer default shipping address', canonical_property_uri: null, parent_path: 'customer' },
  ],
  validation_rules: [
    { rule_id: 'shopify-customers-id-required', description: 'Customer ID must be present', severity: 'warning', constraint: { required: ['id'] }, target_fields: ['id'] },
    { rule_id: 'shopify-customers-email-required', description: 'Customer email must be present', severity: 'warning', constraint: { required: ['email'] }, target_fields: ['email'] },
    { rule_id: 'shopify-customers-email-format', description: 'Customer email must be a valid email address', severity: 'warning', constraint: { properties: { email: { format: 'email' } } }, target_fields: ['email'] },
    { rule_id: 'shopify-customers-first-name-required', description: 'Customer first name must be present', severity: 'warning', constraint: { required: ['first_name'] }, target_fields: ['first_name'] },
    { rule_id: 'shopify-customers-last-name-required', description: 'Customer last name must be present', severity: 'warning', constraint: { required: ['last_name'] }, target_fields: ['last_name'] },
  ],
  transformation_template: {
    steps: [
      { order: 0, transform_type: 'rename-field', operation_config: { mappings: { first_name: 'givenName', last_name: 'familyName' } }, description: 'Rename Shopify customer fields to schema.org canonical property names' },
      { order: 1, transform_type: 'format-timestamp', operation_config: { fields: ['created_at', 'updated_at'], input_format: 'ISO8601', output_format: 'ISO8601' }, description: 'Normalize customer timestamps to consistent ISO 8601 format' },
      { order: 2, transform_type: 'flatten', operation_config: { field: 'default_address', prefix: 'address_', fields_to_extract: ['address1', 'city', 'province', 'country', 'zip'] }, description: 'Flatten nested default_address object into top-level fields with address_ prefix' },
      { order: 3, transform_type: 'select-fields', operation_config: { fields: ['id', 'email', 'givenName', 'familyName', 'phone', 'created_at', 'updated_at', 'orders_count', 'total_spent', 'verified_email', 'address_address1', 'address_city', 'address_province', 'address_country', 'address_zip'] }, description: 'Select only mapped fields for the canonical output' },
    ],
    sample_input: [
      { id: 6012345678901, email: 'jane@example.com', first_name: 'Jane', last_name: 'Doe', phone: '+1-555-123-4567', created_at: '2024-06-15T10:00:00-05:00', updated_at: '2025-01-10T14:30:00-05:00', orders_count: 5, total_spent: '649.95', verified_email: true, default_address: { address1: '123 Main St', city: 'Portland', province: 'OR', country: 'US', zip: '97201' } },
      { id: 6012345678902, email: 'john@example.com', first_name: 'John', last_name: 'Smith', phone: null, created_at: '2024-09-20T08:00:00-05:00', updated_at: '2025-01-11T09:15:00-05:00', orders_count: 2, total_spent: '118.00', verified_email: true, default_address: { address1: '456 Oak Ave', city: 'Seattle', province: 'WA', country: 'US', zip: '98101' } },
      { id: 6012345678903, email: 'alex@example.com', first_name: 'Alex', last_name: 'Johnson', phone: '+1-555-987-6543', created_at: '2025-01-01T12:00:00-05:00', updated_at: '2025-01-12T16:45:00-05:00', orders_count: 1, total_spent: '249.50', verified_email: false, default_address: { address1: '789 Elm Blvd', city: 'Vancouver', province: 'BC', country: 'CA', zip: 'V6B 1A1' } },
    ],
    expected_output: [
      { id: 6012345678901, email: 'jane@example.com', givenName: 'Jane', familyName: 'Doe', phone: '+1-555-123-4567', created_at: '2024-06-15T10:00:00-05:00', updated_at: '2025-01-10T14:30:00-05:00', orders_count: 5, total_spent: '649.95', verified_email: true, address_address1: '123 Main St', address_city: 'Portland', address_province: 'OR', address_country: 'US', address_zip: '97201' },
      { id: 6012345678902, email: 'john@example.com', givenName: 'John', familyName: 'Smith', phone: null, created_at: '2024-09-20T08:00:00-05:00', updated_at: '2025-01-11T09:15:00-05:00', orders_count: 2, total_spent: '118.00', verified_email: true, address_address1: '456 Oak Ave', address_city: 'Seattle', address_province: 'WA', address_country: 'US', address_zip: '98101' },
      { id: 6012345678903, email: 'alex@example.com', givenName: 'Alex', familyName: 'Johnson', phone: '+1-555-987-6543', created_at: '2025-01-01T12:00:00-05:00', updated_at: '2025-01-12T16:45:00-05:00', orders_count: 1, total_spent: '249.50', verified_email: false, address_address1: '789 Elm Blvd', address_city: 'Vancouver', address_province: 'BC', address_country: 'CA', address_zip: 'V6B 1A1' },
    ],
  },
  relationships: [],
};

// ─── Export ──────────────────────────────────────────────────────────────────

/** All Shopify vocabulary entries (community-contributable data) */
export const SHOPIFY_ENTRIES = [shopifyOrders, shopifyProducts, shopifyCustomers];
