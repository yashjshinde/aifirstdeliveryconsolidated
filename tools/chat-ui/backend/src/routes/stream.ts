import { Router } from "express";

import { getRun, type RunEvent } from "../lib/cli-spawner.js";

export const streamRouter = Router();

/**
 * GET /api/stream/:runId
 *
 * Server-Sent Events stream of the subprocess stdout/stderr/exit events.
 * The connection stays open until the subprocess exits or the client
 * disconnects. Late subscribers receive the buffered backlog first.
 */
streamRouter.get("/:runId", (req, res) => {
  const { runId } = req.params;
  const run = getRun(runId);
  if (!run) {
    res.status(404).json({ error: `Unknown runId: ${runId}` });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  // CORS is set by the global middleware in src/index.ts; ensure no buffering proxy interferes.
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Send any buffered events first (late-subscriber recovery).
  for (const ev of run.buffer) {
    writeSSE(res, ev);
  }
  // If already ended, close immediately after the backlog.
  if (run.endedAt) {
    res.end();
    return;
  }

  function onEvent(ev: RunEvent) {
    writeSSE(res, ev);
  }
  function onClose() {
    res.end();
  }

  run.emitter.on("event", onEvent);
  run.emitter.on("close", onClose);

  req.on("close", () => {
    run.emitter.off("event", onEvent);
    run.emitter.off("close", onClose);
  });
});

function writeSSE(res: import("express").Response, ev: RunEvent) {
  res.write(`event: ${ev.kind}\n`);
  res.write(`data: ${JSON.stringify(ev)}\n\n`);
}
