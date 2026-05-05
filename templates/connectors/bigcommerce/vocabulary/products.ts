/**
 * BigCommerce Products Vocabulary Entry (Canonical Source)
 *
 * Community-contributable vocabulary data for BigCommerce products.
 * Conforms to the VocabularyEntry interface defined in ../../vocabulary-types.ts
 */

import type { VocabularyEntry } from '../../vocabulary-types';

const SCHEMA_NS = 'https://schema.org/';

export const bigcommerceProducts: VocabularyEntry = {
  connector_type: 'bigcommerce',
  sync_entity: 'products',
  version: '1.0.0',
  last_verified: '2025-01-15T00:00:00.000Z',
  template_slug: 'bigcommerce',
  canonical_type_uri: `${SCHEMA_NS}Product`,
  confidence_override: 'verified',
  confidence_score: 0.95,
  description: 'BigCommerce products representing items available for sale with pricing, inventory, and categorization.',
  json_schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['id', 'name', 'type', 'sku', 'price'],
    properties: {
      id: { type: 'number', description: 'Unique product identifier' },
      name: { type: 'string', description: 'Product name' },
      type: { type: 'string', description: 'Product type (physical, digital)' },
      sku: { type: 'string', description: 'Stock keeping unit identifier' },
      price: { type: 'number', description: 'Default product price (excluding tax)' },
      sale_price: { type: 'number', description: 'Sale price (0 if not on sale)' },
      inventory_level: { type: 'number', description: 'Current inventory level' },
      categories: {
        type: 'array',
        description: 'Array of category IDs the product belongs to',
        items: { type: 'number' },
      },
    },
  },
  fields: [
    {
      name: 'id',
      type: 'number',
      required: true,
      description: 'Unique product identifier',
      canonical_property_uri: `${SCHEMA_NS}identifier`,
    },
    {
      name: 'name',
      type: 'string',
      required: true,
      description: 'Product name',
      canonical_property_uri: `${SCHEMA_NS}name`,
    },
    {
      name: 'type',
      type: 'string',
      required: true,
      description: 'Product type (physical, digital)',
      canonical_property_uri: null,
    },
    {
      name: 'sku',
      type: 'string',
      required: true,
      description: 'Stock keeping unit identifier',
      canonical_property_uri: `${SCHEMA_NS}sku`,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      description: 'Default product price (excluding tax)',
      canonical_property_uri: `${SCHEMA_NS}price`,
    },
    {
      name: 'sale_price',
      type: 'number',
      required: false,
      description: 'Sale price (0 if not on sale)',
      canonical_property_uri: `${SCHEMA_NS}price`,
    },
    {
      name: 'inventory_level',
      type: 'number',
      required: false,
      description: 'Current inventory level',
      canonical_property_uri: `${SCHEMA_NS}QuantitativeValue`,
    },
    {
      name: 'categories',
      type: 'array',
      required: false,
      description: 'Array of category IDs the product belongs to',
      canonical_property_uri: `${SCHEMA_NS}category`,
    },
  ],
  validation_rules: [
    {
      rule_id: 'bigcommerce-products-id-required',
      description: 'Product ID must be present',
      severity: 'warning',
      constraint: { required: ['id'] },
      target_fields: ['id'],
    },
    {
      rule_id: 'bigcommerce-products-name-required',
      description: 'Product name must be present',
      severity: 'warning',
      constraint: { required: ['name'] },
      target_fields: ['name'],
    },
    {
      rule_id: 'bigcommerce-products-sku-required',
      description: 'Product SKU must be present',
      severity: 'warning',
      constraint: { required: ['sku'] },
      target_fields: ['sku'],
    },
    {
      rule_id: 'bigcommerce-products-price-type',
      description: 'Product price must be a number',
      severity: 'warning',
      constraint: { properties: { price: { type: 'number' } } },
      target_fields: ['price'],
    },
  ],
  transformation_template: {
    steps: [
      {
        order: 0,
        transform_type: 'rename-field',
        operation_config: {
          mappings: {
            name: 'productName',
            sku: 'skuIdentifier',
            price: 'priceValue',
            sale_price: 'salePrice',
            inventory_level: 'quantitativeValue',
            categories: 'productCategory',
          },
        },
        description: 'Rename BigCommerce product fields to schema.org canonical property names',
      },
      {
        order: 1,
        transform_type: 'select-fields',
        operation_config: {
          fields: [
            'id',
            'productName',
            'type',
            'skuIdentifier',
            'priceValue',
            'salePrice',
            'quantitativeValue',
            'productCategory',
          ],
        },
        description: 'Select only mapped fields for the canonical output',
      },
    ],
    sample_input: [
      {
        id: 77,
        name: 'Classic T-Shirt',
        type: 'physical',
        sku: 'CTS-BLK-M',
        price: 24.99,
        sale_price: 19.99,
        inventory_level: 150,
        categories: [18, 25],
      },
      {
        id: 88,
        name: 'Baseball Cap',
        type: 'physical',
        sku: 'BC-NAV-OS',
        price: 25.52,
        sale_price: 0,
        inventory_level: 75,
        categories: [18],
      },
      {
        id: 55,
        name: 'Running Shoes',
        type: 'physical',
        sku: 'RS-WHT-10',
        price: 299.99,
        sale_price: 249.99,
        inventory_level: 30,
        categories: [12, 40],
      },
    ],
    expected_output: [
      {
        id: 77,
        productName: 'Classic T-Shirt',
        type: 'physical',
        skuIdentifier: 'CTS-BLK-M',
        priceValue: 24.99,
        salePrice: 19.99,
        quantitativeValue: 150,
        productCategory: [18, 25],
      },
      {
        id: 88,
        productName: 'Baseball Cap',
        type: 'physical',
        skuIdentifier: 'BC-NAV-OS',
        priceValue: 25.52,
        salePrice: 0,
        quantitativeValue: 75,
        productCategory: [18],
      },
      {
        id: 55,
        productName: 'Running Shoes',
        type: 'physical',
        skuIdentifier: 'RS-WHT-10',
        priceValue: 299.99,
        salePrice: 249.99,
        quantitativeValue: 30,
        productCategory: [12, 40],
      },
    ],
  },
  relationships: [],
};
