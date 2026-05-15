'use strict';

module.exports = function createClaudeProvider({ apiKey, modelName } = {}) {
  let Anthropic;
  try {
    Anthropic = require('@anthropic-ai/sdk');
  } catch {
    throw new Error(
      'Anthropic SDK not installed.\nRun: npm install  (in tools/runner/)'
    );
  }

  const resolvedKey = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!resolvedKey) {
    throw new Error(
      'Anthropic API key required.\nSet ANTHROPIC_API_KEY env var or pass --api-key'
    );
  }

  const client = new Anthropic({ apiKey: resolvedKey });
  const model = modelName || 'claude-sonnet-4-6';

  return {
    async run(systemPrompt, userPrompt) {
      let fullResponse = '';

      const stream = client.messages.stream({
        model,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          process.stdout.write(chunk.delta.text);
          fullResponse += chunk.delta.text;
        }
      }

      return fullResponse;
    },
  };
};
