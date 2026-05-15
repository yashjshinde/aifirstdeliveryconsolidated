/**
 * Repository path discovery. Walks up from `process.cwd()` (or
 * `process.env.CHAT_UI_REPO_ROOT` when set) looking for `agents.yaml` to find
 * the repo root. Mirrors the convention used in `tools/mcp-server/lib/repo-paths.ts`.
 */

import { existsSync, statSync } from "node:fs";
import { dirname, resolve, join } from "node:path";

const ROOT_MARKER = "agents.yaml";

let cachedRoot: string | null = null;

export function findRepoRoot(startDir: string = process.env.CHAT_UI_REPO_ROOT ?? process.cwd()): string {
  if (cachedRoot && existsSync(join(cachedRoot, ROOT_MARKER))) {
    return cachedRoot;
  }
  let current = resolve(startDir);
  for (; ;) {
    if (existsSync(join(current, ROOT_MARKER))) {
      cachedRoot = current;
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error(
        `Could not locate repo root (no ${ROOT_MARKER} found walking up from ${startDir}). Set CHAT_UI_REPO_ROOT env var to override.`,
      );
    }
    current = parent;
  }
}

export function repoPath(...segments: string[]): string {
  return join(findRepoRoot(), ...segments);
}

export function projectsRoot(): string {
  return repoPath("projects");
}

export function projectRoot(project: string): string {
  return repoPath("projects", project);
}

export function agentsRoot(): string {
  return repoPath("agents");
}

export function agentRoot(agent: string): string {
  return repoPath("agents", agent);
}

export function isDir(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

export function isFile(p: string): boolean {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

/**
 * Resolve a user-supplied relative path to an absolute path inside the repo,
 * refusing any path that escapes the repo root or contains `..` traversal.
 * Returns the absolute path on success; throws on traversal attempts.
 */
export function safeRepoPath(relPath: string): string {
  const root = findRepoRoot();
  const resolved = resolve(root, relPath);
  if (!resolved.startsWith(root + (root.endsWith("/") || root.endsWith("\\") ? "" : "/"))
      && !resolved.startsWith(root + "\\")
      && resolved !== root) {
    // On Windows, `startsWith(root + "/")` won't trigger with backslash paths.
    // Allow when resolved is exactly root OR a descendant.
    throw new Error(`Path traversal denied: ${relPath} resolves outside repo root.`);
  }
  return resolved;
}
