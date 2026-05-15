/**
 * Express entry point for the chat UI backend.
 *
 * Routes mounted under /api/* per design/13-chat-ui.md.
 */

import cors from "cors";
import express from "express";

import { logger } from "./lib/logger.js";
import { findRepoRoot } from "./lib/repo-paths.js";
import { agentsRouter } from "./routes/agents.js";
import { commandsRouter } from "./routes/commands.js";
import { docsRouter } from "./routes/docs.js";
import { projectsRouter } from "./routes/projects.js";
import { streamRouter } from "./routes/stream.js";
import { workflowRouter } from "./routes/workflow.js";

const PORT = Number(process.env.PORT ?? 5173);

function main(): void {
  let repoRoot: string;
  try {
    repoRoot = findRepoRoot();
  } catch (err) {
    logger.error("repo root not found", { err: String(err) });
    process.exit(2);
  }
  logger.info("chat-ui backend starting", { repoRoot, port: PORT });

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", repoRoot, time: new Date().toISOString() });
  });

  app.use("/api/projects", projectsRouter);
  app.use("/api/agents", agentsRouter);
  app.use("/api/workflow", workflowRouter);
  app.use("/api/docs", docsRouter);
  app.use("/api/commands", commandsRouter);
  app.use("/api/stream", streamRouter);

  // 404 for unmatched /api/*
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found." });
  });

  app.listen(PORT, () => {
    logger.info("chat-ui backend listening", { port: PORT, url: `http://localhost:${PORT}` });
  });
}

main();
