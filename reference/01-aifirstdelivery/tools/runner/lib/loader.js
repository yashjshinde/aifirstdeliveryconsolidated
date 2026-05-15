'use strict';

const fs = require('fs');
const path = require('path');

const VALID_DOMAINS = [
  'd365-ce', 'd365-ce-brownfield', 'd365-fo', 'integration', 'power-apps',
  'data-migration', 'solution-architect', 'solution-estimate',
];

async function loadDomainPrompt(domain, command, templatesDir) {
  if (!VALID_DOMAINS.includes(domain)) {
    throw new Error(
      `Unknown domain "${domain}".\nValid domains: ${VALID_DOMAINS.join(', ')}`
    );
  }

  const domainDir = path.join(templatesDir, domain);
  if (!fs.existsSync(domainDir)) {
    throw new Error(`Domain folder not found: ${domainDir}`);
  }

  // Load CLAUDE.md — the primary agent rules and workflow
  const claudeMdPath = path.join(domainDir, 'constitution', 'CLAUDE.md');
  if (!fs.existsSync(claudeMdPath)) {
    throw new Error(`constitution/CLAUDE.md not found for domain "${domain}"`);
  }
  const claudeMd = fs.readFileSync(claudeMdPath, 'utf8');

  // Load all other constitution files (numbered standards files)
  const constitutionDir = path.join(domainDir, 'constitution');
  const constitutionFiles = fs.readdirSync(constitutionDir)
    .filter(f => f.endsWith('.md') && f !== 'CLAUDE.md')
    .sort()
    .map(f => ({
      name: f,
      path: path.join(constitutionDir, f),
      content: fs.readFileSync(path.join(constitutionDir, f), 'utf8'),
    }));

  // Load the command file
  const commandsDir = path.join(domainDir, '.claude', 'commands');
  const commandPath = path.join(commandsDir, `${command}.md`);

  if (!fs.existsSync(commandPath)) {
    const available = fs.existsSync(commandsDir)
      ? fs.readdirSync(commandsDir)
          .filter(f => f.endsWith('.md'))
          .map(f => f.replace('.md', ''))
          .sort()
          .join(', ')
      : '(commands directory not found)';
    throw new Error(
      `Command "${command}" not found for domain "${domain}".\nAvailable commands: ${available}`
    );
  }

  const commandContent = fs.readFileSync(commandPath, 'utf8');

  // Load any template files referenced in the command (e.g. specs/_template.md,
  // plans/_template-structured.md, doc-templates/fdd-template.md).
  // This ensures the runner-assembled prompt contains the same structural guidance
  // that Claude Code reads directly from the filesystem.
  const templateFiles = loadReferencedTemplates(commandContent, domainDir);

  return { claudeMd, constitutionFiles, commandContent, templateFiles, domain, command };
}

/**
 * Scan command content for template file path references and return those that exist.
 * Matches patterns like: specs/_template.md  plans/_clarify-template.md  doc-templates/fdd-template.md
 */
function loadReferencedTemplates(commandContent, domainDir) {
  const pattern = /\b(specs|plans|tasks|doc-templates)\/([^\s`'")\]]+\.(?:md|yaml))/g;
  const seen = new Set();
  const files = [];

  let match;
  while ((match = pattern.exec(commandContent)) !== null) {
    const relPath = match[0];
    if (seen.has(relPath)) continue;
    seen.add(relPath);

    const absPath = path.join(domainDir, relPath);
    if (fs.existsSync(absPath)) {
      files.push({ name: relPath, content: fs.readFileSync(absPath, 'utf8') });
    }
  }

  return files;
}

module.exports = { loadDomainPrompt };
