import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { getAdoConfig, createAdoClient } from "./utils/ado-client.js";
import { registerWorkItemTools } from "./tools/work-items.js";
import { registerTestPlanTools } from "./tools/test-plans.js";
import { registerQueryTools } from "./tools/queries.js";
import { registerWikiTools } from "./tools/wiki.js";
import { registerPipelineTools } from "./tools/pipelines.js";
import { registerRepositoryTools } from "./tools/repositories.js";
import type { AxiosInstance } from "axios";

function buildServer() {
  const server = new McpServer({ name: "ado-alm", version: "1.1.0" });

  // Lazy-init client so config errors surface at tool-call time, not startup
  let _client: AxiosInstance | null = null;
  let _orgUrl: string | null = null;

  function getClient(): AxiosInstance {
    if (!_client) {
      const config = getAdoConfig();
      _orgUrl = config.orgUrl;
      _client = createAdoClient(config);
    }
    return _client;
  }

  function getOrgUrl(): string {
    if (!_orgUrl) getClient();
    return _orgUrl!;
  }

  registerWorkItemTools(server, getClient, getOrgUrl);
  registerTestPlanTools(server, getClient, getOrgUrl);
  registerQueryTools(server, getClient);
  registerWikiTools(server, getClient);
  registerPipelineTools(server, getClient);
  registerRepositoryTools(server, getClient);

  return server;
}

const transport = process.env.MCP_TRANSPORT ?? "stdio";

if (transport === "http") {
  const port = parseInt(process.env.PORT ?? "3000", 10);
  const app = express();
  app.use(express.json());

  // One SSE transport per active connection (single-client local use)
  let sseTransport: SSEServerTransport | undefined;

  app.get("/sse", async (_req, res) => {
    const server = buildServer();
    sseTransport = new SSEServerTransport("/messages", res);
    await server.connect(sseTransport);
    console.error("[ado-alm mcp] Client connected via SSE");

    res.on("close", () => {
      console.error("[ado-alm mcp] SSE client disconnected");
      sseTransport = undefined;
    });
  });

  app.post("/messages", async (req, res) => {
    if (!sseTransport) {
      res.status(400).json({ error: "No active SSE connection — GET /sse first" });
      return;
    }
    await sseTransport.handlePostMessage(req, res);
  });

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      transport: "http/sse",
      version: "1.1.0",
      connected: !!sseTransport,
    });
  });

  app.listen(port, () => {
    console.error(`[ado-alm mcp] HTTP/SSE server listening on http://localhost:${port}`);
    console.error(`[ado-alm mcp]   SSE      : GET  http://localhost:${port}/sse`);
    console.error(`[ado-alm mcp]   Messages : POST http://localhost:${port}/messages`);
    console.error(`[ado-alm mcp]   Health   : GET  http://localhost:${port}/health`);
  });
} else {
  const server = buildServer();
  const stdioTransport = new StdioServerTransport();
  await server.connect(stdioTransport);
}
