/**
 * Minimal JSON Schema instance validator for connector contract tests.
 * Supports the subset used by template action input_schema and entity record schemas:
 * type (incl. unions), properties, required, additionalProperties, enum, minimum,
 * maximum, default, format (date-time / ignored for presence), $schema/$id/title/description.
 */

function typeMatches(value, type) {
  if (type === 'null') return value === null;
  if (type === 'array') return Array.isArray(value);
  if (type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (type === 'integer') return typeof value === 'number' && Number.isInteger(value);
  if (type === 'number') return typeof value === 'number' && !Number.isNaN(value);
  if (type === 'string') return typeof value === 'string';
  if (type === 'boolean') return typeof value === 'boolean';
  return false;
}

/**
 * @param {unknown} instance
 * @param {Record<string, unknown>} schema
 * @param {string} [path]
 * @returns {string[]} error messages
 */
export function validateInstance(instance, schema, path = '$') {
  const errors = [];
  if (!schema || typeof schema !== 'object') {
    errors.push(`${path}: schema must be an object`);
    return errors;
  }

  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => typeMatches(instance, t))) {
      errors.push(`${path}: expected type ${types.join('|')}, got ${describe(instance)}`);
      return errors;
    }
  }

  if (schema.enum !== undefined && Array.isArray(schema.enum)) {
    if (!schema.enum.includes(instance)) {
      errors.push(`${path}: value not in enum ${JSON.stringify(schema.enum)}`);
    }
  }

  if (typeof instance === 'number') {
    if (typeof schema.minimum === 'number' && instance < schema.minimum) {
      errors.push(`${path}: ${instance} < minimum ${schema.minimum}`);
    }
    if (typeof schema.maximum === 'number' && instance > schema.maximum) {
      errors.push(`${path}: ${instance} > maximum ${schema.maximum}`);
    }
  }

  if (schema.type === 'object' || (Array.isArray(schema.type) && schema.type.includes('object')) || schema.properties) {
    if (instance !== null && typeof instance === 'object' && !Array.isArray(instance)) {
      const props = /** @type {Record<string, unknown>} */ (schema.properties || {});
      const required = /** @type {string[]} */ (schema.required || []);
      for (const key of required) {
        if (!(key in instance) || instance[key] === undefined) {
          errors.push(`${path}: missing required property "${key}"`);
        }
      }
      for (const [key, value] of Object.entries(instance)) {
        if (key in props) {
          errors.push(
            ...validateInstance(value, /** @type {Record<string, unknown>} */ (props[key]), `${path}.${key}`)
          );
        } else if (schema.additionalProperties === false) {
          errors.push(`${path}: additional property "${key}" not allowed`);
        } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
          errors.push(
            ...validateInstance(
              value,
              /** @type {Record<string, unknown>} */ (schema.additionalProperties),
              `${path}.${key}`
            )
          );
        }
      }
    }
  }

  if (schema.type === 'array' || (Array.isArray(schema.type) && schema.type.includes('array'))) {
    if (Array.isArray(instance) && schema.items && typeof schema.items === 'object') {
      instance.forEach((item, i) => {
        errors.push(
          ...validateInstance(item, /** @type {Record<string, unknown>} */ (schema.items), `${path}[${i}]`)
        );
      });
    }
  }

  return errors;
}

/**
 * Assert input_schema itself is a usable JSON Schema object definition.
 * @param {unknown} schema
 * @param {string} label
 * @returns {string[]}
 */
export function validateInputSchemaShape(schema, label) {
  const errors = [];
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return [`${label}: input_schema must be an object`];
  }
  const s = /** @type {Record<string, unknown>} */ (schema);
  if (s.type !== 'object' && !(Array.isArray(s.type) && s.type.includes('object'))) {
    errors.push(`${label}: input_schema.type must be "object"`);
  }
  if (s.properties !== undefined && (typeof s.properties !== 'object' || Array.isArray(s.properties))) {
    errors.push(`${label}: input_schema.properties must be an object when present`);
  }
  if (s.required !== undefined && !Array.isArray(s.required)) {
    errors.push(`${label}: input_schema.required must be an array when present`);
  }
  if (s.properties && typeof s.properties === 'object') {
    for (const [key, prop] of Object.entries(s.properties)) {
      if (!prop || typeof prop !== 'object' || Array.isArray(prop)) {
        errors.push(`${label}: properties.${key} must be a schema object`);
        continue;
      }
      const p = /** @type {Record<string, unknown>} */ (prop);
      if (p.type === undefined && p.enum === undefined && p.$ref === undefined) {
        errors.push(`${label}: properties.${key} should declare type or enum`);
      }
    }
  }
  return errors;
}

function describe(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Extract list at records_path (empty path => root). Matches catalog-runtime getAtPath.
 * @param {unknown} root
 * @param {string} path
 */
export function getAtPath(root, path) {
  if (!path || !String(path).trim()) return root;
  let cur = root;
  for (const p of String(path).split('.').filter(Boolean)) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = /** @type {Record<string, unknown>} */ (cur)[p];
  }
  return cur;
}
