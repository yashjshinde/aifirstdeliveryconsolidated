/**
 * Validate-Config.cjs — small CLI shim used by the scaffold PowerShell scripts.
 *
 * Validates a YAML or JSON file against one of the schemas in repo `schemas/`.
 * Re-uses AJV + js-yaml that are already installed for tools/mcp-server.
 *
 * Usage:
 *   node tools/scaffold/lib/Validate-Config.cjs <file-to-validate> <schema-filename>
 *
 * Examples:
 *   node tools/scaffold/lib/Validate-Config.cjs projects/acme/project.config.yaml project-config.v1.json
 *   node tools/scaffold/lib/Validate-Config.cjs projects/acme/d365-ce/features/case-mgmt/.workflow.json workflow-state.v1.json
 *
 * Exit codes: 0 = valid, 1 = invalid (errors printed to stderr), 2 = bad arguments
 */

const path = require("path");
const fs = require("fs");

if (process.argv.length < 4) {
  console.error("Usage: node Validate-Config.cjs <file> <schema-filename>");
  process.exit(2);
}

const filePath = path.resolve(process.argv[2]);
const schemaFilename = process.argv[3];

// Walk up to find repo root (agents.yaml marker).
function findRepoRoot(start) {
  let dir = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(dir, "agents.yaml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("Could not find repo root (no agents.yaml found)");
    }
    dir = parent;
  }
}

const repoRoot = findRepoRoot(__dirname);
const schemaPath = path.join(repoRoot, "schemas", schemaFilename);
if (!fs.existsSync(schemaPath)) {
  console.error(`Schema not found: ${schemaPath}`);
  process.exit(2);
}
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(2);
}

// Resolve AJV + js-yaml via the mcp-server's installed node_modules.
const mcpModulesDir = path.join(repoRoot, "tools", "mcp-server", "node_modules");
require.resolve.paths(""); // satisfy linter
const nodeModulePaths = [mcpModulesDir, path.join(repoRoot, "node_modules")];

function resolveModule(name) {
  for (const dir of nodeModulePaths) {
    const candidate = path.join(dir, name);
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Module '${name}' not found in: ${nodeModulePaths.join(", ")}`);
}

const Ajv = require(resolveModule("ajv"));
const addFormats = require(resolveModule("ajv-formats"));
const yaml = require(resolveModule("js-yaml"));

const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const validator = ajv.compile(schema);

const ext = path.extname(filePath).toLowerCase();
let raw = fs.readFileSync(filePath, "utf8");
// Strip UTF-8 BOM if present (PowerShell 5.1's Set-Content -Encoding UTF8 writes one;
// JSON.parse rejects it explicitly, js-yaml tolerates it but stripping is harmless).
if (raw.charCodeAt(0) === 0xfeff) {
  raw = raw.slice(1);
}
let data;
try {
  data = ext === ".json" ? JSON.parse(raw) : yaml.load(raw);
} catch (err) {
  console.error(`Parse error in ${filePath}: ${err.message}`);
  process.exit(1);
}

const valid = validator(data);
if (valid) {
  console.log(`VALID: ${filePath} against ${schemaFilename}`);
  process.exit(0);
} else {
  console.error(`INVALID: ${filePath} against ${schemaFilename}`);
  for (const e of validator.errors || []) {
    const inst = e.instancePath || "(root)";
    const params = e.params ? ` ${JSON.stringify(e.params)}` : "";
    console.error(`  ${inst}: ${e.message}${params}`);
  }
  process.exit(1);
}
