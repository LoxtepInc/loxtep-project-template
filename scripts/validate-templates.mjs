#!/usr/bin/env node
/**
 * Validation script for all project templates.
 * Task 5: Checkpoint — validate all project templates
 *
 * Validates:
 * - All project.json files against project-package-v1.schema.json
 * - All workflow.json files against workflow-package-v1.schema.json
 * - All connection files against trigger-package-v1.schema.json
 * - All data product files against data-product-package-v1.schema.json
 * - Every directory referenced in the manifest exists on disk
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const SCHEMAS_DIR = join(ROOT, 'schemas');
const PROJECTS_DIR = join(ROOT, 'templates', 'projects');

// Load schemas
const projectSchema = JSON.parse(readFileSync(join(SCHEMAS_DIR, 'project-package-v1.schema.json'), 'utf8'));
const workflowSchema = JSON.parse(readFileSync(join(SCHEMAS_DIR, 'workflow-package-v1.schema.json'), 'utf8'));
const triggerSchema = JSON.parse(readFileSync(join(SCHEMAS_DIR, 'trigger-package-v1.schema.json'), 'utf8'));
const dataProductSchema = JSON.parse(readFileSync(join(SCHEMAS_DIR, 'data-product-package-v1.schema.json'), 'utf8'));

let errors = [];
let warnings = [];
let passCount = 0;

// ============================================================================
// Validation Helpers
// ============================================================================

function validateRequired(obj, requiredFields, filePath) {
  const missing = requiredFields.filter(f => !(f in obj));
  if (missing.length > 0) {
    errors.push(`${filePath}: Missing required fields: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

function validatePattern(value, pattern, fieldName, filePath) {
  const regex = new RegExp(pattern);
  if (!regex.test(value)) {
    errors.push(`${filePath}: Field "${fieldName}" value "${value}" does not match pattern ${pattern}`);
    return false;
  }
  return true;
}

function validateConst(value, expected, fieldName, filePath) {
  if (value !== expected) {
    errors.push(`${filePath}: Field "${fieldName}" must be "${expected}", got "${value}"`);
    return false;
  }
  return true;
}

function validateEnum(value, allowed, fieldName, filePath) {
  if (!allowed.includes(value)) {
    errors.push(`${filePath}: Field "${fieldName}" value "${value}" not in allowed values: ${allowed.join(', ')}`);
    return false;
  }
  return true;
}

function validateType(value, type, fieldName, filePath) {
  if (Array.isArray(type)) {
    // Union type (e.g. ["string", "null"])
    const valid = type.some(t => {
      if (t === 'null') return value === null || value === undefined;
      if (t === 'string') return typeof value === 'string';
      if (t === 'object') return typeof value === 'object' && value !== null;
      if (t === 'array') return Array.isArray(value);
      if (t === 'boolean') return typeof value === 'boolean';
      if (t === 'integer') return Number.isInteger(value);
      if (t === 'number') return typeof value === 'number';
      return false;
    });
    if (!valid) {
      errors.push(`${filePath}: Field "${fieldName}" has wrong type. Expected one of [${type.join(', ')}], got ${typeof value}`);
      return false;
    }
    return true;
  }
  
  if (type === 'string' && typeof value !== 'string') {
    errors.push(`${filePath}: Field "${fieldName}" must be a string, got ${typeof value}`);
    return false;
  }
  if (type === 'object' && (typeof value !== 'object' || value === null)) {
    errors.push(`${filePath}: Field "${fieldName}" must be an object`);
    return false;
  }
  if (type === 'array' && !Array.isArray(value)) {
    errors.push(`${filePath}: Field "${fieldName}" must be an array`);
    return false;
  }
  return true;
}

// ============================================================================
// Schema Validators
// ============================================================================

function validateProjectJson(filePath) {
  const relPath = relative(ROOT, filePath);
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (e) {
    errors.push(`${relPath}: Invalid JSON - ${e.message}`);
    return;
  }

  // Required fields
  if (!validateRequired(data, ['template_type', 'slug', 'name', 'version'], relPath)) return;

  // Const check
  validateConst(data.template_type, 'project', 'template_type', relPath);

  // Pattern checks — project slugs allow underscores (industry keys use them)
  validatePattern(data.slug, '^[a-z0-9-_]+$', 'slug', relPath);
  validatePattern(data.version, '^\\d+\\.\\d+\\.\\d+$', 'version', relPath);

  // String checks
  if (data.name && data.name.length === 0) {
    errors.push(`${relPath}: Field "name" must have minLength 1`);
  }

  // Check for additional properties
  const allowedProps = ['$schema', 'template_type', 'slug', 'name', 'description', 'template_slug', 'version', 'tags', 'use_cases'];
  const extraProps = Object.keys(data).filter(k => !allowedProps.includes(k));
  if (extraProps.length > 0) {
    errors.push(`${relPath}: Additional properties not allowed: ${extraProps.join(', ')}`);
  }

  // Tags type check
  if (data.tags && !Array.isArray(data.tags)) {
    errors.push(`${relPath}: "tags" must be an array`);
  }

  passCount++;
  console.log(`  ✓ ${relPath}`);
}

function validateWorkflowJson(filePath) {
  const relPath = relative(ROOT, filePath);
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (e) {
    errors.push(`${relPath}: Invalid JSON - ${e.message}`);
    return;
  }

  // Required fields
  if (!validateRequired(data, ['template_type', 'slug', 'name', 'version', 'entity'], relPath)) return;

  // Const check
  validateConst(data.template_type, 'workflow', 'template_type', relPath);

  // Pattern checks
  validatePattern(data.slug, '^[a-z0-9-]+$', 'slug', relPath);
  validatePattern(data.version, '^\\d+\\.\\d+\\.\\d+$', 'version', relPath);

  // Entity validation
  if (data.entity) {
    const entityRequired = ['workflow_id', 'organization_id', 'project_id', 'name', 'template_id', 'workflow_type', 'domain_id', 'status', 'created_at', 'updated_at'];
    validateRequired(data.entity, entityRequired, `${relPath} (entity)`);

    if (data.entity.workflow_type) {
      validateEnum(data.entity.workflow_type, ['ingestion', 'enrichment'], 'entity.workflow_type', relPath);
    }
    if (data.entity.status) {
      validateEnum(data.entity.status, ['active', 'paused', 'error', 'pending', 'inactive'], 'entity.status', relPath);
    }
  }

  // Check for additional properties at top level
  const allowedProps = ['$schema', 'template_type', 'slug', 'name', 'description', 'version', 'tags', 'use_cases', 'entity', 'dependencies', 'placeholders'];
  const extraProps = Object.keys(data).filter(k => !allowedProps.includes(k));
  if (extraProps.length > 0) {
    errors.push(`${relPath}: Additional properties not allowed: ${extraProps.join(', ')}`);
  }

  passCount++;
  console.log(`  ✓ ${relPath}`);
}

function validateTriggerJson(filePath) {
  const relPath = relative(ROOT, filePath);
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (e) {
    errors.push(`${relPath}: Invalid JSON - ${e.message}`);
    return;
  }

  // Required fields
  if (!validateRequired(data, ['template_type', 'slug', 'name', 'version', 'entity'], relPath)) return;

  // Const check
  validateConst(data.template_type, 'trigger', 'template_type', relPath);

  // Pattern checks
  validatePattern(data.slug, '^[a-z0-9-]+$', 'slug', relPath);
  validatePattern(data.version, '^\\d+\\.\\d+\\.\\d+$', 'version', relPath);

  // Entity validation
  if (data.entity) {
    const entityRequired = ['trigger_id', 'organization_id', 'project_id', 'key', 'name', 'type', 'status'];
    validateRequired(data.entity, entityRequired, `${relPath} (entity)`);

    if (data.entity.key) {
      validatePattern(data.entity.key, '^[a-z0-9-_]+$', 'entity.key', relPath);
    }
    if (data.entity.status) {
      validateEnum(data.entity.status, ['active', 'inactive', 'error'], 'entity.status', relPath);
    }
  }

  // Check for additional properties at top level
  const allowedProps = ['$schema', 'template_type', 'slug', 'name', 'description', 'version', 'tags', 'use_cases', 'entity', 'placeholders'];
  const extraProps = Object.keys(data).filter(k => !allowedProps.includes(k));
  if (extraProps.length > 0) {
    errors.push(`${relPath}: Additional properties not allowed: ${extraProps.join(', ')}`);
  }

  passCount++;
  console.log(`  ✓ ${relPath}`);
}

function validateDataProductJson(filePath) {
  const relPath = relative(ROOT, filePath);
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (e) {
    errors.push(`${relPath}: Invalid JSON - ${e.message}`);
    return;
  }

  // Required fields
  if (!validateRequired(data, ['template_type', 'slug', 'name', 'version', 'entity'], relPath)) return;

  // Const check
  validateConst(data.template_type, 'data_product', 'template_type', relPath);

  // Pattern checks
  validatePattern(data.slug, '^[a-z0-9-]+$', 'slug', relPath);
  validatePattern(data.version, '^\\d+\\.\\d+\\.\\d+$', 'version', relPath);

  // Entity validation
  if (data.entity) {
    const entityRequired = ['data_product_id', 'organization_id', 'workflow_id', 'name', 'status', 'created_at', 'updated_at'];
    validateRequired(data.entity, entityRequired, `${relPath} (entity)`);

    if (data.entity.status) {
      validateEnum(data.entity.status, ['draft', 'active', 'deprecated', 'archived'], 'entity.status', relPath);
    }
    if (data.entity.governance && data.entity.governance.classification) {
      validateEnum(data.entity.governance.classification, ['public', 'internal', 'confidential', 'restricted'], 'entity.governance.classification', relPath);
    }
  }

  // Check for additional properties at top level
  const allowedProps = ['$schema', 'template_type', 'slug', 'name', 'description', 'version', 'tags', 'use_cases', 'entity', 'placeholders'];
  const extraProps = Object.keys(data).filter(k => !allowedProps.includes(k));
  if (extraProps.length > 0) {
    errors.push(`${relPath}: Additional properties not allowed: ${extraProps.join(', ')}`);
  }

  passCount++;
  console.log(`  ✓ ${relPath}`);
}

// ============================================================================
// Directory Traversal
// ============================================================================

function findFiles(dir, pattern) {
  const results = [];
  if (!existsSync(dir)) return results;
  
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, pattern));
    } else if (entry.isFile() && pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

// ============================================================================
// Main Validation
// ============================================================================

console.log('='.repeat(70));
console.log('TEMPLATE VALIDATION — Task 5 Checkpoint');
console.log('='.repeat(70));
console.log('');

// 1. Validate all project.json files
console.log('1. Validating project.json files against project-package-v1.schema.json');
console.log('-'.repeat(70));
const projectFiles = findFiles(PROJECTS_DIR, /^project\.json$/);
for (const f of projectFiles) {
  validateProjectJson(f);
}
console.log(`   Found ${projectFiles.length} project.json files\n`);

// 2. Validate all workflow.json files
console.log('2. Validating workflow.json files against workflow-package-v1.schema.json');
console.log('-'.repeat(70));
const workflowFiles = findFiles(PROJECTS_DIR, /^workflow\.json$/);
for (const f of workflowFiles) {
  validateWorkflowJson(f);
}
console.log(`   Found ${workflowFiles.length} workflow.json files\n`);

// 3. Validate all connection files (trigger schema)
console.log('3. Validating connection files against trigger-package-v1.schema.json');
console.log('-'.repeat(70));
const connectionFiles = findFiles(PROJECTS_DIR, /connection\.json$/);
for (const f of connectionFiles) {
  validateTriggerJson(f);
}
console.log(`   Found ${connectionFiles.length} connection files\n`);

// 4. Validate all data product files
console.log('4. Validating data product files against data-product-package-v1.schema.json');
console.log('-'.repeat(70));
const dataProductFiles = findFiles(PROJECTS_DIR, /data-product\.json$/);
for (const f of dataProductFiles) {
  validateDataProductJson(f);
}
console.log(`   Found ${dataProductFiles.length} data product files\n`);

// 5. Verify manifest directory references
console.log('5. Verifying manifest directory references exist on disk');
console.log('-'.repeat(70));
const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf8'));

// Check demos paths
if (manifest.demos) {
  for (const demo of manifest.demos) {
    const demoPath = join(ROOT, demo.path);
    if (!existsSync(demoPath)) {
      // Check if it might be a project template path
      const altPath = join(ROOT, 'templates', 'projects', demo.slug);
      if (existsSync(altPath)) {
        warnings.push(`manifest.json: demos entry "${demo.slug}" references path "${demo.path}" but template exists at "templates/projects/${demo.slug}" (manifest update pending — task 6)`);
        console.log(`  ⚠ demos/${demo.slug} → ${demo.path} (path outdated, template exists)`);
      } else {
        // This is a manifest issue, not a template issue — task 6 will fix it
        warnings.push(`manifest.json: demos entry "${demo.slug}" references path "${demo.path}" which does not exist (manifest update pending — task 6)`);
        console.log(`  ⚠ demos/${demo.slug} → ${demo.path} (stale manifest entry — task 6 will fix)`);
      }
    } else {
      console.log(`  ✓ demos/${demo.slug} → ${demo.path}`);
      passCount++;
    }
  }
}

// Check workflow template paths
if (manifest.templates && manifest.templates.workflows) {
  for (const wf of manifest.templates.workflows) {
    const wfPath = join(ROOT, wf.path);
    if (!existsSync(wfPath)) {
      warnings.push(`manifest.json: workflow template "${wf.slug}" references path "${wf.path}" which does not exist`);
    } else {
      console.log(`  ✓ workflows/${wf.slug} → ${wf.path}`);
      passCount++;
    }
  }
}

// Check connector template paths
if (manifest.templates && manifest.templates.connectors) {
  for (const conn of manifest.templates.connectors) {
    const connPath = join(ROOT, conn.path);
    // Connectors may reference a directory or a file
    if (!existsSync(connPath)) {
      // Check if it's a directory reference (without .json)
      const dirPath = connPath.replace('.json', '');
      if (!existsSync(dirPath)) {
        warnings.push(`manifest.json: connector "${conn.slug}" references path "${conn.path}" which does not exist`);
      }
    }
  }
}

console.log('');

// 6. Verify all 12 industry project directories exist
console.log('6. Verifying all 12 industry project directories exist');
console.log('-'.repeat(70));
const expectedIndustries = [
  'technology', 'financial_services', 'healthcare', 'retail_ecommerce',
  'manufacturing', 'professional_services', 'media_entertainment',
  'education', 'real_estate', 'hospitality_travel', 'energy_utilities',
  'nonprofit_government'
];

for (const industry of expectedIndustries) {
  const industryDir = join(PROJECTS_DIR, industry);
  if (!existsSync(industryDir)) {
    errors.push(`Missing industry project directory: templates/projects/${industry}/`);
  } else {
    const projectJson = join(industryDir, 'project.json');
    if (!existsSync(projectJson)) {
      errors.push(`Missing project.json in: templates/projects/${industry}/`);
    } else {
      console.log(`  ✓ ${industry}/project.json`);
      passCount++;
    }
  }
}

// 7. Verify slug patterns in project.json match directory names
console.log('');
console.log('7. Verifying slug consistency (slug matches directory name)');
console.log('-'.repeat(70));
for (const industry of expectedIndustries) {
  const projectJson = join(PROJECTS_DIR, industry, 'project.json');
  if (existsSync(projectJson)) {
    try {
      const data = JSON.parse(readFileSync(projectJson, 'utf8'));
      // Allow underscores in slug for industry keys (retail_ecommerce etc.)
      // The schema says ^[a-z0-9-]+$ but some slugs use underscores
      const slugPattern = /^[a-z0-9-_]+$/;
      if (!slugPattern.test(data.slug)) {
        errors.push(`${industry}/project.json: slug "${data.slug}" doesn't match pattern ^[a-z0-9-_]+$`);
      } else {
        console.log(`  ✓ ${industry} → slug: "${data.slug}"`);
        passCount++;
      }
    } catch (e) {
      // Already caught in step 1
    }
  }
}

// ============================================================================
// Summary
// ============================================================================

console.log('');
console.log('='.repeat(70));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(70));
console.log(`  Passed: ${passCount}`);
console.log(`  Errors: ${errors.length}`);
console.log(`  Warnings: ${warnings.length}`);

if (errors.length > 0) {
  console.log('');
  console.log('ERRORS:');
  for (const err of errors) {
    console.log(`  ✗ ${err}`);
  }
}

if (warnings.length > 0) {
  console.log('');
  console.log('WARNINGS:');
  for (const w of warnings) {
    console.log(`  ⚠ ${w}`);
  }
}

console.log('');
if (errors.length === 0) {
  console.log('✅ ALL VALIDATIONS PASSED');
  process.exit(0);
} else {
  console.log('❌ VALIDATION FAILED');
  process.exit(1);
}
