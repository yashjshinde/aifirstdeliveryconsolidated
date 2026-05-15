'use strict';

const fs = require('fs');
const path = require('path');

// Parses <file path="...">content</file> blocks from model response and writes them
async function writeFiles(response, contextDir) {
  const written = [];
  const fileRegex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
  let match;

  while ((match = fileRegex.exec(response)) !== null) {
    const [, filePath, rawContent] = match;

    // Reject any path that tries to escape the context directory
    const fullPath = path.resolve(contextDir, filePath);
    if (!fullPath.startsWith(path.resolve(contextDir))) {
      console.warn(`Skipped unsafe path: ${filePath}`);
      continue;
    }

    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, rawContent.trimStart(), 'utf8');
    written.push(filePath);
  }

  // Print the agent's non-file output (summary, status lines, etc.)
  const commentary = response
    .replace(/<file path="[^"]+">([\s\S]*?)<\/file>/g, '')
    .trim();

  if (commentary) {
    process.stdout.write('\n' + commentary + '\n');
  }

  return written;
}

module.exports = { writeFiles };
