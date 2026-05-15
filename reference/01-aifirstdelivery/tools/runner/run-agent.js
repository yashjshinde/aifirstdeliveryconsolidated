#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const path = require('path');
const fs = require('fs');

const { loadDomainPrompt } = require('./lib/loader');
const { buildPrompt } = require('./lib/prompt-builder');
const { getProvider } = require('./lib/providers');
const { writeFiles } = require('./lib/file-writer');

function resolveTemplatesDir(optionValue) {
  if (optionValue) return path.resolve(optionValue);
  // Try cwd/templates first (running from repo root)
  const cwdTemplates = path.join(process.cwd(), 'templates');
  if (fs.existsSync(cwdTemplates)) return cwdTemplates;
  // Fall back to path relative to this script (running from tools/runner/)
  return path.resolve(__dirname, '../../templates');
}

program
  .name('run-agent')
  .description('Run an AI First Delivery agent command using any model provider')
  .argument('<domain>', 'Domain: d365-ce | d365-ce-brownfield | d365-fo | integration | power-apps | data-migration | solution-architect | solution-estimate')
  .argument('<command>', 'Command name: spec | review | plan | task | fdd | implement | etc.')
  .argument('[feature]', 'Feature or migration identifier (e.g. my-feature, sftp-to-dv-accounts)')
  .option('--model <provider>', 'Model provider: claude | openai | azure-openai | prompt-file', 'claude')
  .option('--model-name <name>', 'Specific model name to use (overrides provider default)')
  .option('--api-key <key>', 'API key (or set ANTHROPIC_API_KEY / OPENAI_API_KEY env var)')
  .option('--azure-endpoint <url>', 'Azure OpenAI endpoint URL')
  .option('--azure-deployment <name>', 'Azure OpenAI deployment name')
  .option('--context-dir <dir>', 'Project working directory containing specs/, plans/, etc.', process.cwd())
  .option('--templates-dir <dir>', 'Path to the templates directory (auto-detected if omitted)')
  .option('--output-prompt <file>', 'Write the assembled prompt to a markdown file — paste into any chat UI')
  .option('--dry-run', 'Print the assembled prompt to stdout without calling the API')
  .action(async (domain, command, feature, options) => {
    try {
      const templatesDir = resolveTemplatesDir(options.templatesDir);
      const contextDir = path.resolve(options.contextDir);

      if (!fs.existsSync(templatesDir)) {
        throw new Error(`Templates directory not found: ${templatesDir}\nSet --templates-dir to the path containing your domain agent folders.`);
      }

      // Load constitution + command file
      const loaded = await loadDomainPrompt(domain, command, templatesDir);

      // Build system + user prompt
      const { systemPrompt, userPrompt } = buildPrompt(loaded, feature, contextDir);

      // Output prompt to file (for manual paste into any chat UI including Copilot)
      if (options.outputPrompt) {
        const outPath = path.resolve(options.outputPrompt);
        const header = [
          `# Assembled Agent Prompt`,
          ``,
          `**Domain:** ${domain} | **Command:** /${command}${feature ? ` | **Feature:** ${feature}` : ''}`,
          ``,
          `Paste the System Prompt into the AI model's system prompt field, then paste the User Prompt as your first message.`,
          `Or paste both into a single chat turn separated by the divider.`,
          ``,
          `---`,
          ``,
        ].join('\n');
        const content = `${header}## System Prompt\n\n${systemPrompt}\n\n---\n\n## User Prompt\n\n${userPrompt}\n`;
        fs.writeFileSync(outPath, content, 'utf8');
        console.log(`Prompt written to: ${outPath}`);
        console.log(`Paste the contents into GitHub Copilot Chat, ChatGPT, or any chat UI.`);
        return;
      }

      if (options.dryRun) {
        console.log('=== SYSTEM PROMPT ===\n');
        console.log(systemPrompt);
        console.log('\n=== USER PROMPT ===\n');
        console.log(userPrompt);
        return;
      }

      // Get model provider and run
      const provider = getProvider(options.model, {
        apiKey: options.apiKey,
        modelName: options.modelName,
        azureEndpoint: options.azureEndpoint,
        azureDeployment: options.azureDeployment,
      });

      console.log(`\nRunning /${command} [${domain}]${feature ? ` — ${feature}` : ''} via ${options.model}\n${'─'.repeat(60)}\n`);

      const response = await provider.run(systemPrompt, userPrompt);

      // Extract and write any <file> blocks from the response
      const filesWritten = await writeFiles(response, contextDir);
      if (filesWritten.length > 0) {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`Files written (${filesWritten.length}):`);
        filesWritten.forEach(f => console.log(`  ✓ ${f}`));
      }

    } catch (err) {
      console.error(`\nError: ${err.message}`);
      if (process.env.DEBUG) console.error(err.stack);
      process.exit(1);
    }
  });

program.parse();
