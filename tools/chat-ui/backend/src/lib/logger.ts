/**
 * Minimal structured logger. Writes to stderr to avoid colliding with anything
 * that might pipe stdout (consistent with the MCP server convention).
 */

type Level = "debug" | "info" | "warn" | "error";

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const configuredLevel = ((): Level => {
  const env = (process.env.LOG_LEVEL ?? "info").toLowerCase() as Level;
  return env in LEVELS ? env : "info";
})();

function log(level: Level, msg: string, meta?: Record<string, unknown>) {
  if (LEVELS[level] < LEVELS[configuredLevel]) return;
  const payload: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level: level.toUpperCase(),
    msg,
  };
  if (meta) Object.assign(payload, meta);
  process.stderr.write(`${JSON.stringify(payload)}\n`);
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
};
