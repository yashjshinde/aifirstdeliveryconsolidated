/**
 * Read-only filesystem access scoped to the repo root. All paths are validated
 * against traversal attempts by `safeRepoPath()`.
 */

import { promises as fs } from "node:fs";
import { extname, relative, resolve } from "node:path";

import { findRepoRoot, isDir, isFile, safeRepoPath } from "./repo-paths.js";

const TEXT_EXTENSIONS = new Set([
  ".md", ".markdown",
  ".yaml", ".yml",
  ".json",
  ".txt", ".log",
  ".ts", ".js", ".tsx", ".jsx",
  ".css", ".html",
  ".bicep", ".ps1", ".sh",
  ".sql", ".xml",
]);

export interface TreeNode {
  name: string;
  path: string;          // relative-to-repo-root path
  type: "file" | "directory";
  size?: number;
  children?: TreeNode[];
}

export async function listDir(relPath: string): Promise<TreeNode[]> {
  const abs = safeRepoPath(relPath);
  if (!isDir(abs)) {
    throw new Error(`Not a directory: ${relPath}`);
  }
  const entries = await fs.readdir(abs, { withFileTypes: true });
  const out: TreeNode[] = [];
  for (const e of entries) {
    if (e.name.startsWith(".") && e.name !== ".workflow.json") continue;
    if (e.name === "node_modules" || e.name === "dist") continue;
    const childRel = (relPath ? `${relPath}/` : "") + e.name;
    if (e.isDirectory()) {
      out.push({ name: e.name, path: childRel, type: "directory" });
    } else if (e.isFile()) {
      const stat = await fs.stat(safeRepoPath(childRel));
      out.push({ name: e.name, path: childRel, type: "file", size: stat.size });
    }
  }
  out.sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return out;
}

export async function readTextFile(relPath: string): Promise<{ content: string; mime: string }> {
  const abs = safeRepoPath(relPath);
  if (!isFile(abs)) {
    throw new Error(`Not a file: ${relPath}`);
  }
  const ext = extname(abs).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) {
    throw new Error(`Refusing to read non-text file: ${relPath}`);
  }
  const stat = await fs.stat(abs);
  if (stat.size > 5 * 1024 * 1024) {
    throw new Error(`File too large (>5 MB): ${relPath}`);
  }
  const content = await fs.readFile(abs, "utf-8");
  return { content, mime: mimeFor(ext) };
}

function mimeFor(ext: string): string {
  switch (ext) {
    case ".md":
    case ".markdown": return "text/markdown";
    case ".json": return "application/json";
    case ".yaml":
    case ".yml": return "application/yaml";
    case ".html": return "text/html";
    default: return "text/plain";
  }
}

export function toRepoRelative(absPath: string): string {
  const root = findRepoRoot();
  const rel = relative(root, resolve(absPath));
  return rel.split(/[\\/]/).join("/");
}
