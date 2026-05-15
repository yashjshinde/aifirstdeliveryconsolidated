/**
 * Filesystem utilities — YAML/JSON read+write, recursive directory walk, frontmatter extraction.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import yaml from "js-yaml";

export function readText(path: string): string {
  return readFileSync(path, "utf8");
}

export function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

export function readJson<T = unknown>(path: string): T {
  return JSON.parse(readText(path)) as T;
}

export function writeJson(path: string, data: unknown, indent: number = 2): void {
  writeText(path, JSON.stringify(data, null, indent) + "\n");
}

export function readYaml<T = unknown>(path: string): T {
  return yaml.load(readText(path)) as T;
}

export function writeYaml(path: string, data: unknown): void {
  writeText(path, yaml.dump(data, { lineWidth: 120, noRefs: true }));
}

/**
 * Recursively walk a directory, returning all matching file paths (no directories).
 * `filter` defaults to .md files. Pass `() => true` to include everything.
 */
export function walkFiles(
  root: string,
  filter: (path: string) => boolean = (p) => p.endsWith(".md")
): string[] {
  if (!existsSync(root)) return [];
  const result: string[] = [];
  const stack: string[] = [root];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(dir, entry);
      let stat;
      try {
        stat = statSync(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        // skip noisy folders
        if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
        stack.push(full);
      } else if (stat.isFile() && filter(full)) {
        result.push(full);
      }
    }
  }
  return result.sort();
}

/**
 * Extract YAML frontmatter from a Markdown file.
 * Returns { frontmatter, body } — frontmatter is null if the file has no `---` block.
 */
export function extractFrontmatter(content: string): {
  frontmatter: Record<string, unknown> | null;
  body: string;
} {
  // YAML frontmatter is delimited by --- at start and a matching --- afterward.
  if (!content.startsWith("---\n") && !content.startsWith("---\r\n")) {
    return { frontmatter: null, body: content };
  }
  // Find the closing --- by scanning lines (handles both \n and \r\n).
  const lines = content.split(/\r?\n/);
  // line 0 is the opening "---". find next "---" line
  let closingLineIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      closingLineIdx = i;
      break;
    }
  }
  if (closingLineIdx === -1) {
    return { frontmatter: null, body: content };
  }
  const fmText = lines.slice(1, closingLineIdx).join("\n");
  const bodyText = lines.slice(closingLineIdx + 1).join("\n");
  try {
    const parsed = yaml.load(fmText) as Record<string, unknown> | null;
    return { frontmatter: parsed ?? null, body: bodyText };
  } catch {
    return { frontmatter: null, body: content };
  }
}

export { existsSync };
