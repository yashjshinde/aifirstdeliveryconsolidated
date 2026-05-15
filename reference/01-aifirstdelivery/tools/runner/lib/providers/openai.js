'use strict';

module.exports = function createOpenAIProvider({ apiKey, modelName } = {}) {
  let OpenAI;
  try {
    OpenAI = require('openai');
  } catch {
    throw new Error(
      'OpenAI SDK not installed.\nRun: npm install  (in tools/runner/)'
    );
  }

  const resolvedKey = apiKey || process.env.OPENAI_API_KEY;
  if (!resolvedKey) {
    throw new Error(
      'OpenAI API key required.\nSet OPENAI_API_KEY env var or pass --api-key'
    );
  }

  const client = new OpenAI({ apiKey: resolvedKey });
  const model = modelName || 'gpt-4o';

  return {
    async run(systemPrompt, userPrompt) {
      let fullResponse = '';

      const stream = await client.chat.completions.create({
        model,
        max_tokens: 8192,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        process.stdout.write(text);
        fullResponse += text;
      }

      return fullResponse;
    },
  };
};
