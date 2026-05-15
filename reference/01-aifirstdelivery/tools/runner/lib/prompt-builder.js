'use strict';

const fs = require('fs');
const path = require('path');

// Context files the runner auto-loads when they exist for the given feature
const CONTEXT_CANDIDATES = [
  'specs/{f}/spec.md',
  'specs/{f}/review.md',
  'specs/{f}/impact-analysis.md',
  'plans/{f}/plan.md',
  'plans/{f}/clarify.md',
  'plans/{f}/work-items.yaml',
  'docs-generated/{f}/field-mapping.md',
  'docs-generated/{f}/pipeline-design.md',
  'docs-generated/{f}/functional-design-document.md',
  'docs-generated/{f}/technical-design-document.md',
  'docs-generated/{f}/solution-blueprint.md',
  'docs/{f}/fdd.md',
  'docs/{f}/fdd-review.md',
  'docs/{f}/tdd.md',
  'docs/{f}/tdd-review.md',
];

const RUNNER_PREAMBLE = `\
You are an AI First Delivery agent running outside Claude Code via the universal runner.

FILE OUTPUT FORMAT — to create or update files, wrap content in XML tags:
<file path="relative/path/to/file.md">
file content goes here
</file>
The runner automatically extracts and writes these files to the project working directory.
Use paths relative to the project root (e.g. specs/my-feature/spec.md).

You must read ALL constitution rules below before generating any output.
The constitution overrides all other instructions.
ADO / MCP tool calls are not available in this mode — generate files only; skip ALM steps.
`;

function buildPrompt({ claudeMd, constitutionFiles, commandContent, templateFiles, domain, command }, feature, contextDir) {
  // ── System prompt: preamble + constitution + template files ─────────────────
  const constitutionBlock = constitutionFiles.length > 0
    ? constitutionFiles.map(f => `### ${f.name}\n\n${f.content}`).join('\n\n---\n\n')
    : '';

  const templateBlock = templateFiles && templateFiles.length > 0
    ? templateFiles.map(f => `### ${f.name}\n\n${f.content}`).join('\n\n---\n\n')
    : '';

  const systemPrompt = [
    RUNNER_PREAMBLE,
    '---\n\n## CLAUDE.md — Agent Rules and Workflow\n\n' + claudeMd,
    constitutionBlock ? '---\n\n## Constitution Files\n\n' + constitutionBlock : '',
    templateBlock
      ? '---\n\n## Template Files\n\nUse these as the authoritative output structure when the command references them.\n\n' + templateBlock
      : '',
  ].filter(Boolean).join('\n\n');

  // ── User prompt: command + feature + existing project context ───────────────
  const featureLine = feature
    ? `\n\nFeature / Migration ID: **${feature}**\n`
    : '';

  const contextBlock = feature
    ? loadContextFiles(contextDir, feature)
    : '';

  const userPrompt = [
    commandContent,
    featureLine,
    contextBlock,
  ].filter(Boolean).join('\n\n');

  return { systemPrompt, userPrompt };
}

function loadContextFiles(contextDir, feature) {
  const found = CONTEXT_CANDIDATES
    .map(template => template.replace('{f}', feature))
    .map(rel => ({ rel, abs: path.join(contextDir, rel) }))
    .filter(({ abs }) => fs.existsSync(abs))
    .map(({ rel, abs }) => {
      const content = fs.readFileSync(abs, 'utf8');
      return `### ${rel}\n\n${content}`;
    });

  if (found.length === 0) return '';

  return `---\n\n## Existing Project Context\n\nThe following files already exist and should be used as input:\n\n${found.join('\n\n---\n\n')}`;
}

module.exports = { buildPrompt };
