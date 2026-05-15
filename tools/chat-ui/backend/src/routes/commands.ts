import { Router } from "express";

import { listRuns, startRun, stopRun } from "../lib/cli-spawner.js";
import { projectRoot } from "../lib/repo-paths.js";

export const commandsRouter = Router();

interface RunCommandBody {
  agent: string;
  command: string;
  project?: string;
  feature?: string;
  /** Free-form extra args passed to the CLI after the command. */
  args?: string[];
}

/**
 * POST /api/commands/run
 *
 * Body: { agent, command, project?, feature?, args? }
 *
 * Spawns `claude` in the relevant working directory with arguments derived
 * from the inputs. Returns the runId; subscribers connect via /api/stream/:runId.
 *
 * Argument shape (claude CLI v1):
 *   claude --print "/<agent>:<command> --project <p> --feature <f> [...extra]"
 *
 * (Adjust here if your local CLI uses a different invocation. The chat UI
 * commits to one shape per backend version; switching requires a re-deploy.)
 */
commandsRouter.post("/run", async (req, res) => {
  try {
    const body = req.body as RunCommandBody;
    if (!body?.agent || !body.command) {
      res.status(400).json({ error: "Missing agent or command in body." });
      return;
    }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(body.agent)) {
      res.status(400).json({ error: "Invalid agent slug." });
      return;
    }
    if (!/^[a-z][a-z0-9-]*$/.test(body.command.replace(/^\//, ""))) {
      res.status(400).json({ error: "Invalid command name." });
      return;
    }
    if (body.project && !/^[a-z0-9][a-z0-9-]*$/.test(body.project)) {
      res.status(400).json({ error: "Invalid project name." });
      return;
    }
    if (body.feature && !/^[a-z0-9][a-z0-9-]*$/.test(body.feature)) {
      res.status(400).json({ error: "Invalid feature slug." });
      return;
    }

    const cmd = body.command.startsWith("/") ? body.command : `/${body.command}`;
    const promptParts: string[] = [`/${body.agent}:${cmd.slice(1)}`];
    if (body.project) promptParts.push(`--project`, body.project);
    if (body.feature) promptParts.push(`--feature`, body.feature);
    for (const extra of body.args ?? []) {
      promptParts.push(extra);
    }
    const promptString = promptParts.join(" ");

    const cwd = body.project ? projectRoot(body.project) : undefined;
    const descriptor = startRun({
      args: ["--print", promptString],
      cwd,
    });
    res.json({
      runId: descriptor.runId,
      startedAt: descriptor.startedAt,
      cwd: descriptor.cwd,
      cli: descriptor.command,
      promptString,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/commands/runs
 * Lists all known runs (active + recent terminated).
 */
commandsRouter.get("/runs", async (_req, res) => {
  res.json({ runs: listRuns() });
});

/**
 * POST /api/commands/:runId/stop
 * Signals an active run to stop.
 */
commandsRouter.post("/:runId/stop", async (req, res) => {
  const stopped = stopRun(req.params.runId);
  if (!stopped) {
    res.status(404).json({ error: `Run not found or already ended: ${req.params.runId}` });
    return;
  }
  res.json({ ok: true });
});
