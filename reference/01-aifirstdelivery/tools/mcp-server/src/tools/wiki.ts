import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import axios from "axios";
import { callAdo } from "../utils/ado-client.js";

async function resolveWikiId(client: AxiosInstance, wikiId?: string): Promise<string> {
  if (wikiId) return wikiId;
  const { data } = await client.get("/wiki/wikis?api-version=7.1");
  const wikis = data.value as Array<{ id: string; name: string; type: string }>;
  if (!wikis || wikis.length === 0) throw new Error("No wikis found in this project.");
  // Prefer the project wiki (type = projectWiki) over a code wiki
  const projectWiki = wikis.find((w) => w.type === "projectWiki") ?? wikis[0];
  return projectWiki.id;
}

export function registerWikiTools(
  server: McpServer,
  getClient: () => AxiosInstance
): void {
  server.tool(
    "ado_wiki_list_wikis",
    "List all wikis in the Azure DevOps project",
    {},
    async () => {
      return callAdo(async () => {
        const { data } = await getClient().get("/wiki/wikis?api-version=7.1");
        const wikis = (data.value as Array<{ id: string; name: string; type: string; remoteUrl?: string }>) ?? [];
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(wikis.map((w) => ({ id: w.id, name: w.name, type: w.type })), null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_wiki_push",
    "Create or update a page in the Azure DevOps wiki. Content is plain markdown.",
    {
      path: z.string().describe("Wiki page path, e.g. /Delivery/my-feature/spec"),
      content: z.string().describe("Full markdown content to write to the page"),
      wiki_id: z.string().optional().describe("Wiki ID (auto-resolved from project wiki if omitted)"),
      comment: z.string().optional().describe("Edit comment shown in wiki history"),
    },
    async ({ path: pagePath, content, wiki_id, comment }) => {
      return callAdo(async () => {
        const client = getClient();
        const wikiId = await resolveWikiId(client, wiki_id);
        const encodedPath = encodeURIComponent(pagePath);

        // Try GET to see if page exists and get its ETag
        let eTag: string | undefined;
        try {
          const resp = await client.get(
            `/wiki/wikis/${wikiId}/pages?path=${encodedPath}&api-version=7.1`,
            { responseType: "json" }
          );
          eTag = (resp.headers as Record<string, string>)["etag"];
        } catch (err: unknown) {
          if (!axios.isAxiosError(err) || err.response?.status !== 404) throw err;
          // 404 = new page, no eTag needed
        }

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (eTag) headers["If-Match"] = eTag;

        const body: Record<string, string> = { content };
        if (comment) body.comment = comment;

        const { data } = await client.put(
          `/wiki/wikis/${wikiId}/pages?path=${encodedPath}&api-version=7.1`,
          body,
          { headers }
        );

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              action: eTag ? "updated" : "created",
              path: pagePath,
              wikiId,
              url: data.remoteUrl ?? data.url,
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_wiki_pull",
    "Get the markdown content of a wiki page",
    {
      path: z.string().describe("Wiki page path, e.g. /Delivery/my-feature/spec"),
      wiki_id: z.string().optional().describe("Wiki ID (auto-resolved from project wiki if omitted)"),
    },
    async ({ path: pagePath, wiki_id }) => {
      return callAdo(async () => {
        const client = getClient();
        const wikiId = await resolveWikiId(client, wiki_id);
        const encodedPath = encodeURIComponent(pagePath);

        const { data } = await client.get(
          `/wiki/wikis/${wikiId}/pages?path=${encodedPath}&includeContent=true&api-version=7.1`
        );

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              path: pagePath,
              wikiId,
              content: data.content,
              url: data.remoteUrl ?? data.url,
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_wiki_list_pages",
    "List pages under a wiki path (one level or recursive)",
    {
      path: z.string().optional().describe("Parent path to list under (default: root)"),
      recursive: z.boolean().optional().describe("List all descendants recursively (default: false)"),
      wiki_id: z.string().optional().describe("Wiki ID (auto-resolved from project wiki if omitted)"),
    },
    async ({ path: pagePath, recursive, wiki_id }) => {
      return callAdo(async () => {
        const client = getClient();
        const wikiId = await resolveWikiId(client, wiki_id);
        const recursionLevel = recursive ? "Full" : "OneLevel";
        const pathParam = pagePath ? `&path=${encodeURIComponent(pagePath)}` : "";

        const { data } = await client.get(
          `/wiki/wikis/${wikiId}/pages?recursionLevel=${recursionLevel}${pathParam}&api-version=7.1`
        );

        type WikiPageNode = { path: string; isParentPage?: boolean; subPages?: WikiPageNode[] };
        function flatten(node: WikiPageNode): string[] {
          const results = [node.path];
          for (const sub of node.subPages ?? []) results.push(...flatten(sub));
          return results;
        }

        const pages = flatten(data as WikiPageNode);
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ wikiId, count: pages.length, pages }, null, 2),
          }],
        };
      });
    }
  );
}
