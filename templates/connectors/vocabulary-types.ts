/**
 * Vocabulary Library — shared types for connector vocabulary entries.
 *
 * This is the community-facing type definition file. Connector vocabulary
 * contributors should use these types when authoring new vocabulary entries.
 *
 * The Vocabulary Library unifies two existing sources:
 * 1. Connector template structural data (entity catalogs, JSON Schemas, sync plans)
 * 2. The CONNECTOR_SCHEMA_MAPPINGS semantic registry (schema.org URIs, field mappings)
 *
 * It adds transformation templates composed from existing transform primitives.
 */

/** Confidence tier for vocabulary entries */
export type VocabularyConfidenceTier = 'verified' | 'curated' | 'heuristic';

/** Validation rule severity levels */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/** Confidence tier-to-score mapping constant */
export const CONFIDENCE_TIER_SCORES: Record<VocabularyConfidenceTier, number> = {
  verified: 0.95,
  curated: 0.85,
  heuristic: 0.7,
};

/** A single field definition within a vocabulary entry */
export interface VocabularyFieldDefinition {
  /** API field name from the connector (e.g., "order_number") */
  name: string;
  /** JSON Schema type */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null';
  /** Whether the field is required in the connector's payload */
  required: boolean;
  /** Human-readable description of the field */
  description: string;
  /** Canonical property URI this field maps to (from CONNECTOR_SCHEMA_MAPPINGS) */
  canonical_property_uri: string | null;
  /** JSON Schema format hint (date-time, email, uri, uuid) */
  format?: string;
  /** Parent field path for nested fields (e.g., "customer" for "customer.email") */
  parent_path?: string;
}

/** A validation rule definition within a vocabulary entry */
export interface VocabularyValidationRule {
  /** Rule identifier */
  rule_id: string;
  /** Human-readable rule description */
  description: string;
  /** Severity level (default: warning for auto-inferred) */
  severity: ValidationSeverity;
  /** JSON Schema fragment or constraint expression */
  constraint: Record<string, unknown>;
  /** Fields this rule applies to */
  target_fields: string[];
}

/** A single transformation step referencing an existing transform primitive */
export interface TransformationStep {
  /** Order in the transformation sequence (0-based) */
  order: number;
  /** Transform primitive slug (e.g., "rename-field", "format-timestamp") */
  transform_type: string;
  /** Configuration for this step (matches the primitive's operation_config shape) */
  operation_config: Record<string, unknown>;
  /** Human-readable description of what this step does */
  description: string;
}

/** Transformation template composed from platform transform primitives */
export interface TransformationTemplate {
  /** Ordered sequence of transform steps */
  steps: TransformationStep[];
  /** Sample input records for preview validation */
  sample_input: Record<string, unknown>[];
  /** Expected output after transformation (for preview validation) */
  expected_output: Record<string, unknown>[];
}

/** Entity relationship defined in the vocabulary */
export interface VocabularyRelationship {
  /** Source field in this entity that references another entity */
  source_field: string;
  /** Target entity type (e.g., "customers") */
  target_entity_type: string;
  /** Relationship type URI (e.g., "https://schema.org/customer") */
  relationship_uri: string;
  /** Cardinality: one-to-one or one-to-many */
  cardinality: 'one-to-one' | 'one-to-many';
}

/** A single vocabulary entry describing one connector entity */
export interface VocabularyEntry {
  /** Connector type identifier (e.g., "shopify") */
  connector_type: string;
  /** Sync entity identifier (e.g., "orders") */
  sync_entity: string;
  /** Semver version of this vocabulary entry */
  version: string;
  /** ISO 8601 timestamp when entry was last validated against real API data */
  last_verified: string;
  /** Reference to the source connector template slug */
  template_slug: string;
  /** Canonical type URI (e.g., "https://schema.org/Order") */
  canonical_type_uri: string;
  /** Confidence tier for this entry */
  confidence_override: VocabularyConfidenceTier;
  /** Numeric confidence score derived from tier (0.95, 0.85, 0.7) */
  confidence_score: number;
  /** JSON Schema for the connector's payload structure */
  json_schema: Record<string, unknown>;
  /** Field definitions with semantic mappings */
  fields: VocabularyFieldDefinition[];
  /** Validation rules at three severity levels */
  validation_rules: VocabularyValidationRule[];
  /** Transformation template (null for mapping-only entries) */
  transformation_template: TransformationTemplate | null;
  /** Entity relationships for knowledge graph edges */
  relationships: VocabularyRelationship[];
  /** Human-readable description of this entity */
  description: string;
}
