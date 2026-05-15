import { Router } from "express";
import { promises as fs } from "node:fs";
import path from "node:path";
import { load as yamlLoad } from "js-yaml";

import { projectsRoot, projectRoot, isDir, isFile } from "../lib/repo-paths.js";

export const projectsRouter = Router();

/**
 * GET /api/projects
 * Returns the list of project folders under projects/.
 */
projectsRouter.get("/", async (_req, res) => {
  try {
    const root = projectsRoot();
    if (!isDir(root)) {
      res.json({ projects: [] });
      return;
    }
    const entries = await fs.readdir(root, { withFileTypes: true });
    const projects = entries
      .filter(e => e.isDirectory() && !e.name.startsWith("."))
      .map(e => e.name)
      .sort();
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/projects/:name
 * Returns project.config.yaml content + agent enabling status.
 */
projectsRouter.get("/:name", async (req, res) => {
  try {
    const { name } = req.params;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
      res.status(400).json({ error: "Invalid project name." });
      return;
    }
    const root = projectRoot(name);
    if (!isDir(root)) {
      res.status(404).json({ error: `Project not found: ${name}` });
      return;
    }
    const configPath = path.join(root, "project.config.yaml");
    let config: Record<string, unknown> = {};
    if (isFile(configPath)) {
      const raw = await fs.readFile(configPath, "utf-8");
      const parsed = yamlLoad(raw);
      config = (parsed && typeof parsed === "object") ? parsed as Record<string, unknown> : {};
    }
    // Agent presence -- folder existence under projects/{name}/{agent}/
    const childEntries = await fs.readdir(root, { withFileTypes: true });
    const agentFolders = childEntries
      .filter(e => e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith("."))
      .map(e => e.name);

    res.json({
      name,
      config,
      agentFolders,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
