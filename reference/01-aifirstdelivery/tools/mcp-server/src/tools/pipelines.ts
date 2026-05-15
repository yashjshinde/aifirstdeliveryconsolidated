import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import { callAdo } from "../utils/ado-client.js";

export function registerPipelineTools(
  server: McpServer,
  getClient: () => AxiosInstance
): void {
  server.tool(
    "ado_pipeline_list",
    "List all pipelines (build definitions) in the Azure DevOps project",
    {
      folder: z.string().optional().describe("Filter by folder path, e.g. \\\\MyFolder"),
      top: z.number().optional().describe("Maximum results (default 50)"),
    },
    async ({ folder, top }) => {
      return callAdo(async () => {
        const params = new URLSearchParams({ "api-version": "7.1" });
        if (top) params.set("$top", String(top));
        if (folder) params.set("folderPath", folder);

        const { data } = await getClient().get(`/pipelines?${params}`);
        const pipelines = (data.value as Array<{
          id: number; name: string; folder: string;
          _links: { web: { href: string } };
        }>) ?? [];

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              count: pipelines.length,
              pipelines: pipelines.map((p) => ({
                id: p.id,
                name: p.name,
                folder: p.folder,
                url: p._links?.web?.href,
              })),
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_pipeline_run",
    "Trigger a pipeline run in Azure DevOps",
    {
      pipeline_id: z.number().describe("Pipeline ID to run"),
      branch: z.string().optional().describe("Source branch (e.g. refs/heads/main). Defaults to pipeline default branch."),
      variables: z.record(z.string()).optional().describe("Runtime variables as key-value pairs"),
    },
    async ({ pipeline_id, branch, variables }) => {
      return callAdo(async () => {
        const body: Record<string, unknown> = {};

        if (branch) {
          body.resources = {
            repositories: { self: { refName: branch.startsWith("refs/") ? branch : `refs/heads/${branch}` } },
          };
        }

        if (variables && Object.keys(variables).length > 0) {
          body.variables = Object.fromEntries(
            Object.entries(variables).map(([k, v]) => [k, { value: v }])
          );
        }

        const { data } = await getClient().post(
          `/pipelines/${pipeline_id}/runs?api-version=7.1`,
          body
        );

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              runId: data.id,
              name: data.name,
              state: data.state,
              pipelineId: pipeline_id,
              url: data._links?.web?.href,
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_pipeline_get_run",
    "Get the status and result of a specific pipeline run",
    {
      pipeline_id: z.number().describe("Pipeline ID"),
      run_id: z.number().describe("Run ID returned by ado_pipeline_run"),
    },
    async ({ pipeline_id, run_id }) => {
      return callAdo(async () => {
        const { data } = await getClient().get(
          `/pipelines/${pipeline_id}/runs/${run_id}?api-version=7.1`
        );

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              runId: data.id,
              name: data.name,
              state: data.state,           // inProgress | completed | canceling
              result: data.result,         // succeeded | failed | canceled | (null if in progress)
              createdDate: data.createdDate,
              finishedDate: data.finishedDate,
              url: data._links?.web?.href,
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_pipeline_list_runs",
    "List recent runs for a pipeline",
    {
      pipeline_id: z.number().describe("Pipeline ID"),
      top: z.number().optional().describe("Maximum results (default 10)"),
    },
    async ({ pipeline_id, top }) => {
      return callAdo(async () => {
        const params = new URLSearchParams({
          "api-version": "7.1",
          "$top": String(top ?? 10),
        });

        const { data } = await getClient().get(`/pipelines/${pipeline_id}/runs?${params}`);
        const runs = (data.value as Array<{
          id: number; name: string; state: string; result?: string;
          createdDate: string; finishedDate?: string;
          _links: { web: { href: string } };
        }>) ?? [];

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              pipelineId: pipeline_id,
              count: runs.length,
              runs: runs.map((r) => ({
                id: r.id,
                name: r.name,
                state: r.state,
                result: r.result,
                createdDate: r.createdDate,
                finishedDate: r.finishedDate,
                url: r._links?.web?.href,
              })),
            }, null, 2),
          }],
        };
      });
    }
  );
}
