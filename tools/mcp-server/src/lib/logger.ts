/**
 * Stderr-only logger. The MCP stdio transport reserves stdout for JSON-RPC messages,
 * so all log output goes to stderr.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel: LogLevel = (() => {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env === "debug" || env === "info" || env === "warn" || env === "error") {
    return env;
  }
  return "info";
})();

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[currentLevel];
}

function format(level: LogLevel, msg: string, meta?: Record<string, unknown>): string {
  const ts = new Date().toISOString();
  const metaStr = meta ? " " + JSON.stringify(meta) : "";
  return `[${ts}] [${level.toUpperCase()}] ${msg}${metaStr}`;
}

export const log = {
  debug(msg: string, meta?: Record<string, unknown>): void {
    if (shouldLog("debug")) process.stderr.write(format("debug", msg, meta) + "\n");
  },
  info(msg: string, meta?: Record<string, unknown>): void {
    if (shouldLog("info")) process.stderr.write(format("info", msg, meta) + "\n");
  },
  warn(msg: string, meta?: Record<string, unknown>): void {
    if (shouldLog("warn")) process.stderr.write(format("warn", msg, meta) + "\n");
  },
  error(msg: string, meta?: Record<string, unknown>): void {
    if (shouldLog("error")) process.stderr.write(format("error", msg, meta) + "\n");
  },
};
