'use strict';
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const { AGENTS_DIR } = require('./db');

const ajv = new Ajv({ allErrors: true });
const schemaCache = {};

function loadSchema(name) {
  if (schemaCache[name]) return schemaCache[name];
  const schemaPath = path.join(AGENTS_DIR, 'shared', 'contracts', `${name}.schema.json`);
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  schemaCache[name] = schema;
  return schema;
}

function validate(name, data) {
  const schema = loadSchema(name);
  const valid = ajv.validate(schema, data);
  return { valid, errors: valid ? null : ajv.errors };
}

function getSchemaPath(name) {
  return path.join(AGENTS_DIR, 'shared', 'contracts', `${name}.schema.json`);
}

module.exports = { validate, loadSchema, getSchemaPath };
