/**
 * JSON Schema validation via AJV draft-07. Loads schemas from repo `schemas/` on demand
 * and caches the compiled validators.
 */

import Ajv, { type ValidateFunction, type ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";
import { schemaPath } from "./repo-paths.js";

// AJV v8 + ajv-formats: under Bundler module resolution + esModuleInterop, the default
// import resolves to the CJS module.exports value directly (the Ajv class / addFormats function).
const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
addFormats(ajv);

const validatorCache = new Map<string, ValidateFunction>();

export type ValidationResult = {
  valid: boolean;
  errors: ErrorObject[] | null;
};

/**
 * Load and compile a schema file from repo `schemas/`.
 * `schemaFilename` is the bare filename (e.g., "project-config.v1.json").
 */
export function getValidator(schemaFilename: string): ValidateFunction {
  const cached = validatorCache.get(schemaFilename);
  if (cached) return cached;

  const fullPath = schemaPath(schemaFilename);
  const raw = readFileSync(fullPath, "utf8");
  const schema = JSON.parse(raw);
  const validate = ajv.compile(schema);
  validatorCache.set(schemaFilename, validate);
  return validate;
}

/**
 * Validate a data object against a schema file.
 */
export function validate(schemaFilename: string, data: unknown): ValidationResult {
  const validator = getValidator(schemaFilename);
  const valid = validator(data) as boolean;
  return {
    valid,
    errors: valid ? null : validator.errors ?? [],
  };
}

/**
 * Format AJV errors as a single multi-line string suitable for tool result messages.
 */
export function formatErrors(errors: ErrorObject[] | null): string {
  if (!errors || errors.length === 0) return "(no errors)";
  return errors
    .map((e) => {
      const path = e.instancePath || "(root)";
      const params = e.params ? JSON.stringify(e.params) : "";
      return `  ${path}: ${e.message ?? "validation failed"} ${params}`.trim();
    })
    .join("\n");
}
