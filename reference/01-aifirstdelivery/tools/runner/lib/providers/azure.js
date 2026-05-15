'use strict';

module.exports = function createAzureProvider({ apiKey, modelName, azureEndpoint, azureDeployment } = {}) {
  let OpenAI;
  try {
    OpenAI = require('openai');
  } catch {
    throw new Error(
      'OpenAI SDK not installed.\nRun: npm install  (in tools/runner/)'
    );
  }

  const endpoint = azureEndpoint || process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = azureDeployment || modelName || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
  const resolvedKey = apiKey || process.env.AZURE_OPENAI_API_KEY;

  if (!endpoint) {
    throw new Error(
      'Azure OpenAI endpoint required.\nSet AZURE_OPENAI_ENDPOINT env var or pass --azure-endpoint'
    );
  }
  if (!resolvedKey) {
    throw new Error(
      'Azure OpenAI API key required.\nSet AZURE_OPENAI_API_KEY env var or pass --api-key'
    );
  }

  const client = new OpenAI.AzureOpenAI({
    apiKey: resolvedKey,
    endpoint,
    deployment,
    apiVersion: '2024-08-01-preview',
  });

  return {
    async run(systemPrompt, userPrompt) {
      let fullResponse = '';

      const stream = await client.chat.completions.create({
        model: deployment,
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
