#!/usr/bin/env node
/**
 * MCP server entry point. Registers all tool groups on a single MCP server instance
 * over stdio transport. Phase 2 groups: doc-lint, workflow, handoff, config-resolve.
 *
 * Future groups (queued per design/11-mcp-server.md): alm, converters, traceability,
 * estimation, brownfield-validators, brownfield-engine.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";

import { log } from "./lib/logger.js";
import { findRepoRoot } from "./lib/repo-paths.js";
import { registerDocLint } from "./groups/doc-lint/index.js";
import { registerWorkflow } from "./groups/workflow/index.js";
import { registerHandoff } from "./groups/handoff/index.js";
import { registerConfigResolve } from "./groups/config-resolve/index.js";

/**
 * Tool handlers indexed by tool name.
 * Each handler receives the validated tool input and returns the tool result content.
 */
export type ToolHandler = (
  args: Record<string, unknown>
) => Promise<{ content: Array<{ type: "text"; text: string }> }>;

export type RegisteredTool = {
  tool: Tool;
  handler: ToolHandler;
};

async function main(): Promise<void> {
  try {
    const repoRoot = findRepoRoot();
    log.info("spec-driven-dev-mcp starting", { repoRoot });
  } catch (err) {
    log.warn("repo root not found at startup; tools will error until cwd is inside a repo", {
      error: (err as Error).message,
    });
  }

  const server = new Server(
    {
      name: "spec-driven-dev-mcp",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Collect tools from each group.
  const registry = new Map<string, RegisteredTool>();
  const register = (tools: RegisteredTool[]): void => {
    for (const t of tools) {
      if (registry.has(t.tool.name)) {
        log.warn("duplicate tool name; later registration ignored", { name: t.tool.name });
        continue;
      }
      registry.set(t.tool.name, t);
    }
  };

  register(registerDocLint());
  register(registerWorkflow());
  register(registerHandoff());
  register(registerConfigResolve());

  log.info("registered tool groups", {
    toolCount: registry.size,
    tools: Array.from(registry.keys()),
  });

  // List tools handler.
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: Array.from(registry.values()).map((r) => r.tool),
    };
  });

  // Call tool handler.
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const name = req.params.name;
    const args = (req.params.arguments ?? {}) as Record<string, unknown>;
    const entry = registry.get(name);
    if (!entry) {
      return {
        content: [{ type: "text" as const, text: `Error: unknown tool "${name}"` }],
        isError: true,
      };
    }
    try {
      const result = await entry.handler(args);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error("tool handler threw", { tool: name, error: msg });
      return {
        content: [{ type: "text" as const, text: `Error: ${msg}` }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  log.info("spec-driven-dev-mcp ready (stdio transport)");
}

main().catch((err) => {
  log.error("fatal error in main()", { error: (err as Error).message });
  process.exit(1);
});
