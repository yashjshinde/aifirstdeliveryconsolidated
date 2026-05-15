/**
 * Repository path discovery. The server walks up from process.cwd() looking
 * for `agents.yaml` to find the repo root. All paths are relative to that root.
 *
 * Throws if no repo root is found.
 */

import { existsSync, statSync } from "node:fs";
import { dirname, resolve, join } from "node:path";

const ROOT_MARKER = "agents.yaml";

let cachedRoot: string | null = null;

export function findRepoRoot(startDir: string = process.cwd()): string {
  if (cachedRoot && existsSync(join(cachedRoot, ROOT_MARKER))) {
    return cachedRoot;
  }
  let current = resolve(startDir);
  for (;;) {
    if (existsSync(join(current, ROOT_MARKER))) {
      cachedRoot = current;
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error(
        `Could not locate repo root (no ${ROOT_MARKER} found walking up from ${startDir})`
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

export function projectAgentRoot(project: string, agent: string): string {
  return repoPath("projects", project, agent);
}

export function projectFeatureRoot(project: string, agent: string, feature: string): string {
  return repoPath("projects", project, agent, "features", feature);
}

export function agentsRoot(): string {
  return repoPath("agents");
}

export function agentRoot(agent: string): string {
  return repoPath("agents", agent);
}

export function schemasRoot(): string {
  return repoPath("schemas");
}

export function schemaPath(schemaFilename: string): string {
  return repoPath("schemas", schemaFilename);
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
