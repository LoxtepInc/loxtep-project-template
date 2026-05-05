/**
 * BigCommerce Customers Vocabulary Entry (Canonical Source)
 *
 * Community-contributable vocabulary data for BigCommerce customers.
 * Conforms to the VocabularyEntry interface defined in ../../vocabulary-types.ts
 */

import type { VocabularyEntry } from '../../vocabulary-types';

const SCHEMA_NS = 'https://schema.org/';

export const bigcommerceCustomers: VocabularyEntry = {
  connector_type: 'bigcommerce',
  sync_entity: 'customers',
  version: '1.0.0',
  last_verified: '2025-01-15T00:00:00.000Z',
  template_slug: 'bigcommerce',
  canonical_type_uri: `${SCHEMA_NS}Person`,
  confidence_override: 'verified',
  confidence_score: 0.95,
  description: 'BigCommerce customers representing registered users with contact information and account details.',
  json_schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['id', 'email', 'first_name', 'last_name'],
    properties: {
      id: { type: 'number', description: 'Unique customer identifier' },
      email: { type: 'string', format: 'email', description: 'Customer email address' },
      first_name: { type: 'string', description: 'Customer first name' },
      last_name: { type: 'string', description: 'Customer last name' },
      date_created: { type: 'string', format: 'date-time', description: 'RFC 2822 timestamp of customer registration' },
      phone: { type: 'string', description: 'Customer phone number' },
      company: { type: 'string', description: 'Customer company name' },
    },
  },
  fields: [
    {
      name: 'id',
      type: 'number',
      required: true,
      description: 'Unique customer identifier',
      canonical_property_uri: `${SCHEMA_NS}identifier`,
    },
    {
      name: 'email',
      type: 'string',
      required: true,
      description: 'Customer email address',
      canonical_property_uri: `${SCHEMA_NS}email`,
      format: 'email',
    },
    {
      name: 'first_name',
      type: 'string',
      required: true,
      description: 'Customer first name',
      canonical_property_uri: `${SCHEMA_NS}givenName`,
    },
    {
      name: 'last_name',
      type: 'string',
      required: true,
      description: 'Customer last name',
      canonical_property_uri: `${SCHEMA_NS}familyName`,
    },
    {
      name: 'date_created',
      type: 'string',
      required: false,
      description: 'RFC 2822 timestamp of customer registration',
      canonical_property_uri: `${SCHEMA_NS}dateCreated`,
      format: 'date-time',
    },
    {
      name: 'phone',
      type: 'string',
      required: false,
      description: 'Customer phone number',
      canonical_property_uri: `${SCHEMA_NS}telephone`,
    },
    {
      name: 'company',
      type: 'string',
      required: false,
      description: 'Customer company name',
      canonical_property_uri: `${SCHEMA_NS}worksFor`,
    },
  ],
  validation_rules: [
    {
      rule_id: 'bigcommerce-customers-id-required',
      description: 'Customer ID must be present',
      severity: 'warning',
      constraint: { required: ['id'] },
      target_fields: ['id'],
    },
    {
      rule_id: 'bigcommerce-customers-email-required',
      description: 'Customer email must be present',
      severity: 'warning',
      constraint: { required: ['email'] },
      target_fields: ['email'],
    },
    {
      rule_id: 'bigcommerce-customers-email-format',
      description: 'Customer email must be a valid email address',
      severity: 'warning',
      constraint: { properties: { email: { format: 'email' } } },
      target_fields: ['email'],
    },
    {
      rule_id: 'bigcommerce-customers-first-name-required',
      description: 'Customer first name must be present',
      severity: 'warning',
      constraint: { required: ['first_name'] },
      target_fields: ['first_name'],
    },
    {
      rule_id: 'bigcommerce-customers-last-name-required',
      description: 'Customer last name must be present',
      severity: 'warning',
      constraint: { required: ['last_name'] },
      target_fields: ['last_name'],
    },
  ],
  transformation_template: {
    steps: [
      {
        order: 0,
        transform_type: 'rename-field',
        operation_config: {
          mappings: {
            first_name: 'givenName',
            last_name: 'familyName',
            date_created: 'dateCreated',
            phone: 'telephone',
            company: 'worksFor',
          },
        },
        description: 'Rename BigCommerce customer fields to schema.org canonical property names',
      },
      {
        order: 1,
        transform_type: 'format-timestamp',
        operation_config: {
          fields: ['dateCreated'],
          input_format: 'RFC2822',
          output_format: 'ISO8601',
        },
        description: 'Convert dateCreated from RFC 2822 to ISO 8601 format',
      },
      {
        order: 2,
        transform_type: 'select-fields',
        operation_config: {
          fields: [
            'id',
            'email',
            'givenName',
            'familyName',
            'dateCreated',
            'telephone',
            'worksFor',
          ],
        },
        description: 'Select only mapped fields for the canonical output',
      },
    ],
    sample_input: [
      {
        id: 5,
        email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        date_created: 'Mon, 10 Mar 2024 09:00:00 +0000',
        phone: '+1-555-123-4567',
        company: 'Acme Corp',
      },
      {
        id: 12,
        email: 'bob.jones@example.com',
        first_name: 'Bob',
        last_name: 'Jones',
        date_created: 'Tue, 20 Aug 2024 15:30:00 +0000',
        phone: '+1-555-987-6543',
        company: '',
      },
      {
        id: 30,
        email: 'maria.garcia@example.com',
        first_name: 'Maria',
        last_name: 'Garcia',
        date_created: 'Sat, 04 Jan 2025 12:00:00 +0000',
        phone: '+44-20-7946-0958',
        company: 'Garcia & Partners',
      },
    ],
    expected_output: [
      {
        id: 5,
        email: 'jane.smith@example.com',
        givenName: 'Jane',
        familyName: 'Smith',
        dateCreated: '2024-03-10T09:00:00.000Z',
        telephone: '+1-555-123-4567',
        worksFor: 'Acme Corp',
      },
      {
        id: 12,
        email: 'bob.jones@example.com',
        givenName: 'Bob',
        familyName: 'Jones',
        dateCreated: '2024-08-20T15:30:00.000Z',
        telephone: '+1-555-987-6543',
        worksFor: '',
      },
      {
        id: 30,
        email: 'maria.garcia@example.com',
        givenName: 'Maria',
        familyName: 'Garcia',
        dateCreated: '2025-01-04T12:00:00.000Z',
        telephone: '+44-20-7946-0958',
        worksFor: 'Garcia & Partners',
      },
    ],
  },
  relationships: [],
};
