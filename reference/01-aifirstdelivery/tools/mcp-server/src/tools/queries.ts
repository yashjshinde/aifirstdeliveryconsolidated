import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AxiosInstance } from "axios";

export function registerQueryTools(
  server: McpServer,
  getClient: () => AxiosInstance
): void {
  server.tool(
    "ado_run_wiql",
    "Run a WIQL (Work Item Query Language) query against Azure DevOps",
    {
      query: z.string().describe("WIQL query string, e.g. SELECT [System.Id],[System.Title] FROM WorkItems WHERE [System.TeamProject] = @project"),
      top: z.number().optional().describe("Maximum results to return (default 100)"),
    },
    async ({ query, top }) => {
      const { data } = await getClient().post(
        `/wit/wiql?api-version=7.1${top ? `&$top=${top}` : ""}`,
        { query }
      );
      const ids: number[] = (data.workItems ?? []).map((w: { id: number }) => w.id);
      if (ids.length === 0) {
        return { content: [{ type: "text", text: JSON.stringify({ count: 0, items: [] }, null, 2) }] };
      }

      const idList = ids.slice(0, 200).join(",");
      const { data: items } = await getClient().get(
        `/wit/workitems?ids=${idList}&fields=System.Id,System.Title,System.WorkItemType,System.State,System.AssignedTo&api-version=7.1`
      );

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            count: ids.length,
            items: items.value.map((w: { id: number; fields: Record<string, unknown> }) => ({
              id: w.id,
              type: w.fields["System.WorkItemType"],
              title: w.fields["System.Title"],
              state: w.fields["System.State"],
            })),
          }, null, 2),
        }],
      };
    }
  );

  server.tool(
    "ado_get_area_paths",
    "List all area paths in the project",
    {},
    async () => {
      const { data } = await getClient().get(`/wit/classificationnodes/areas?api-version=7.1&$depth=10`);
      function flatten(node: { name: string; path: string; children?: unknown[] }, depth = 0): string[] {
        const result = [`${"  ".repeat(depth)}${node.path}`];
        for (const child of (node.children ?? []) as typeof node[]) {
          result.push(...flatten(child, depth + 1));
        }
        return result;
      }
      return { content: [{ type: "text", text: flatten(data).join("\n") }] };
    }
  );

  server.tool(
    "ado_get_iterations",
    "List all iteration (sprint) paths in the project",
    {
      depth: z.number().optional().describe("Tree depth (default 5)"),
    },
    async ({ depth }) => {
      const { data } = await getClient().get(
        `/wit/classificationnodes/iterations?api-version=7.1&$depth=${depth ?? 5}`
      );
      function flatten(node: { name: string; path: string; attributes?: { startDate?: string; finishDate?: string }; children?: unknown[] }, d = 0): string[] {
        const dates = node.attributes?.startDate
          ? ` (${node.attributes.startDate?.slice(0, 10)} → ${node.attributes.finishDate?.slice(0, 10)})`
          : "";
        const result = [`${"  ".repeat(d)}${node.path}${dates}`];
        for (const child of (node.children ?? []) as typeof node[]) {
          result.push(...flatten(child, d + 1));
        }
        return result;
      }
      return { content: [{ type: "text", text: flatten(data).join("\n") }] };
    }
  );

  server.tool(
    "ado_get_work_items_by_title",
    "Search for work items by title substring and optional type filter",
    {
      title_contains: z.string().describe("Substring to search for in title"),
      type: z.string().optional().describe("Filter by work item type (e.g. Epic, Feature)"),
      state: z.string().optional().describe("Filter by state (e.g. Active, New)"),
      top: z.number().optional().describe("Max results (default 50)"),
    },
    async ({ title_contains, type, state, top }) => {
      const conditions = [
        `[System.Title] CONTAINS '${title_contains.replace(/'/g, "''")}'`,
      ];
      if (type) conditions.push(`[System.WorkItemType] = '${type}'`);
      if (state) conditions.push(`[System.State] = '${state}'`);

      const wiql = `SELECT [System.Id],[System.Title],[System.WorkItemType],[System.State] FROM WorkItems WHERE ${conditions.join(" AND ")} ORDER BY [System.ChangedDate] DESC`;

      const { data } = await getClient().post(
        `/wit/wiql?api-version=7.1${top ? `&$top=${top}` : "&$top=50"}`,
        { query: wiql }
      );

      const ids: number[] = (data.workItems ?? []).map((w: { id: number }) => w.id);
      if (ids.length === 0) {
        return { content: [{ type: "text", text: JSON.stringify({ count: 0, items: [] }, null, 2) }] };
      }

      const { data: items } = await getClient().get(
        `/wit/workitems?ids=${ids.join(",")}&fields=System.Id,System.Title,System.WorkItemType,System.State&api-version=7.1`
      );

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            count: items.value.length,
            items: items.value.map((w: { id: number; fields: Record<string, unknown> }) => ({
              id: w.id,
              type: w.fields["System.WorkItemType"],
              title: w.fields["System.Title"],
              state: w.fields["System.State"],
            })),
          }, null, 2),
        }],
      };
    }
  );
}
