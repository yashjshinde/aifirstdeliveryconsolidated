'use strict';

function getProvider(model, options = {}) {
  switch (model) {
    case 'claude':
      return require('./claude')(options);
    case 'openai':
      return require('./openai')(options);
    case 'azure-openai':
      return require('./azure')(options);
    case 'prompt-file':
      // prompt-file mode is handled by --output-prompt in the CLI before reaching here
      throw new Error('Use --output-prompt <file> instead of --model prompt-file');
    default:
      throw new Error(
        `Unknown model provider "${model}".\nValid providers: claude, openai, azure-openai\nFor manual paste (Copilot, ChatGPT): use --output-prompt <file>`
      );
  }
}

module.exports = { getProvider };
