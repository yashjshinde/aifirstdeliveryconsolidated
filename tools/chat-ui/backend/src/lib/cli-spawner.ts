/**
 * Subprocess management for invoking the `claude` CLI. Each spawned run is
 * tracked by a `runId`; stdout/stderr lines are buffered + broadcast to any
 * SSE subscriber listening on `/api/stream/:runId`.
 *
 * Sequential model only (v1) -- one active run per session. Parallel runs are
 * deferred per the chat-ui README § Limitations.
 */

import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";

import { logger } from "./logger.js";
import { findRepoRoot, isDir } from "./repo-paths.js";

export type RunEventKind = "stdout" | "stderr" | "exit" | "error";

export interface RunEvent {
  kind: RunEventKind;
  data?: string;
  code?: number | null;
  signal?: NodeJS.Signals | null;
  errorMessage?: string;
  ts: string;
}

export interface RunDescriptor {
  runId: string;
  command: string;
  args: string[];
  cwd: string;
  startedAt: string;
  endedAt?: string;
  exitCode?: number | null;
  signal?: NodeJS.Signals | null;
  buffer: RunEvent[];   // ring-buffer of recent events for late subscribers
  emitter: EventEmitter;
  child?: ChildProcessWithoutNullStreams;
}

const BUFFER_MAX = 2000;
const runs = new Map<string, RunDescriptor>();

export function listRuns(): Array<Omit<RunDescriptor, "emitter" | "child" | "buffer">> {
  return Array.from(runs.values()).map(r => ({
    runId: r.runId,
    command: r.command,
    args: r.args,
    cwd: r.cwd,
    startedAt: r.startedAt,
    endedAt: r.endedAt,
    exitCode: r.exitCode,
    signal: r.signal,
  }));
}

export function getRun(runId: string): RunDescriptor | undefined {
  return runs.get(runId);
}

export interface StartRunInput {
  command: string;
  args?: string[];
  cwd?: string;
}

/**
 * Start a new subprocess and return its descriptor. `command` is the CLI name
 * (defaults to `process.env.CLAUDE_CLI ?? 'claude'`). Working directory must
 * be inside the repo root; defaults to the repo root.
 */
export function startRun(input: StartRunInput): RunDescriptor {
  const claudeCli = process.env.CLAUDE_CLI ?? "claude";
  const root = findRepoRoot();
  const cwd = input.cwd ? input.cwd : root;
  if (!isDir(cwd)) {
    throw new Error(`Working directory does not exist: ${cwd}`);
  }
  if (!cwd.startsWith(root)) {
    throw new Error(`Working directory must be inside the repo root.`);
  }

  const runId = randomUUID();
  const startedAt = new Date().toISOString();
  const emitter = new EventEmitter();

  logger.info("starting subprocess", { runId, command: claudeCli, args: input.args, cwd });

  const child = spawn(claudeCli, input.args ?? [], {
    cwd,
    env: { ...process.env },
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  }) as ChildProcessWithoutNullStreams;

  const descriptor: RunDescriptor = {
    runId,
    command: claudeCli,
    args: input.args ?? [],
    cwd,
    startedAt,
    buffer: [],
    emitter,
    child,
  };
  runs.set(runId, descriptor);

  function record(kind: RunEventKind, data: string | undefined, extras: Partial<RunEvent> = {}) {
    const ev: RunEvent = {
      kind,
      ts: new Date().toISOString(),
      ...(data !== undefined ? { data } : {}),
      ...extras,
    };
    descriptor.buffer.push(ev);
    if (descriptor.buffer.length > BUFFER_MAX) {
      descriptor.buffer.shift();
    }
    emitter.emit("event", ev);
  }

  child.stdout.setEncoding("utf-8");
  child.stderr.setEncoding("utf-8");

  child.stdout.on("data", chunk => record("stdout", chunk));
  child.stderr.on("data", chunk => record("stderr", chunk));

  child.on("error", err => {
    logger.error("subprocess error", { runId, err: err.message });
    record("error", undefined, { errorMessage: err.message });
  });

  child.on("close", (code, signal) => {
    descriptor.endedAt = new Date().toISOString();
    descriptor.exitCode = code;
    descriptor.signal = signal;
    logger.info("subprocess closed", { runId, code, signal });
    record("exit", undefined, { code, signal });
    emitter.emit("close");
  });

  return descriptor;
}

/**
 * Signal a running subprocess to terminate. SIGINT first; SIGTERM after 5s if
 * still alive.
 */
export function stopRun(runId: string): boolean {
  const r = runs.get(runId);
  if (!r || !r.child || r.child.killed || r.endedAt) return false;
  try {
    r.child.kill("SIGINT");
    setTimeout(() => {
      if (r.child && !r.child.killed && !r.endedAt) {
        r.child.kill("SIGTERM");
      }
    }, 5000);
    return true;
  } catch (err) {
    logger.error("failed to kill subprocess", { runId, err: String(err) });
    return false;
  }
}

export function clearOldRuns(maxAgeMs: number = 60 * 60 * 1000) {
  const cutoff = Date.now() - maxAgeMs;
  for (const [runId, r] of runs) {
    if (r.endedAt && new Date(r.endedAt).getTime() < cutoff) {
      runs.delete(runId);
    }
  }
}
