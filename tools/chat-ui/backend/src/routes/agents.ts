import { Router } from "express";
import { promises as fs } from "node:fs";
import path from "node:path";
import { load as yamlLoad } from "js-yaml";

import { agentRoot, agentsRoot, isDir, isFile, repoPath } from "../lib/repo-paths.js";

export const agentsRouter = Router();

interface AgentRegistryEntry {
  name: string;
  version?: string;
  maturity?: string;
  "base-commands"?: boolean;
  "extra-commands"?: string[];
  docScope?: Record<string, string>;
  description?: string;
}

interface AgentsYaml {
  version?: number;
  agents?: AgentRegistryEntry[];
}

/**
 * GET /api/agents
 * Returns the full registry from agents.yaml.
 */
agentsRouter.get("/", async (_req, res) => {
  try {
    const ymlPath = repoPath("agents.yaml");
    if (!isFile(ymlPath)) {
      res.status(404).json({ error: "agents.yaml not found at repo root." });
      return;
    }
    const raw = await fs.readFile(ymlPath, "utf-8");
    const parsed = yamlLoad(raw) as AgentsYaml | undefined;
    const list = parsed?.agents ?? [];
    // Mark which agents have a built folder (presence under agents/{name}/)
    const root = agentsRoot();
    const out = await Promise.all(list.map(async a => {
      const folderPresent = isDir(path.join(root, a.name));
      return { ...a, folderPresent };
    }));
    res.json({ agents: out });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/agents/:name/readme
 * Returns the agent's README.md content.
 */
agentsRouter.get("/:name/readme", async (req, res) => {
  try {
    const { name } = req.params;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
      res.status(400).json({ error: "Invalid agent name." });
      return;
    }
    const readmePath = path.join(agentRoot(name), "README.md");
    if (!isFile(readmePath)) {
      res.status(404).json({ error: `README not found for agent: ${name}` });
      return;
    }
    const content = await fs.readFile(readmePath, "utf-8");
    res.type("text/markdown").send(content);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/agents/:name/commands
 * Returns the list of command names exposed by the agent (filenames under .claude/commands/).
 */
agentsRouter.get("/:name/commands", async (req, res) => {
  try {
    const { name } = req.params;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
      res.status(400).json({ error: "Invalid agent name." });
      return;
    }
    const cmdsDir = path.join(agentRoot(name), ".claude", "commands");
    if (!isDir(cmdsDir)) {
      res.json({ commands: [] });
      return;
    }
    const entries = await fs.readdir(cmdsDir);
    const commands = entries
      .filter(f => f.endsWith(".md") && !f.startsWith("_"))
      .map(f => f.replace(/\.md$/, ""))
      .sort();
    res.json({ commands });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
