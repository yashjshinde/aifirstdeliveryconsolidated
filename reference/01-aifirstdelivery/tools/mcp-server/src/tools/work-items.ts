import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import { markdownToHtml, callAdo } from "../utils/ado-client.js";
import type { WorkItemCreate } from "../types/index.js";

function buildPatchOps(item: WorkItemCreate, orgUrl: string): object[] {
  const ops: object[] = [
    { op: "add", path: "/fields/System.Title", value: item.title },
  ];

  if (item.description) {
    ops.push({ op: "add", path: "/fields/System.Description", value: markdownToHtml(item.description) });
  }
  if (item.acceptanceCriteria) {
    ops.push({ op: "add", path: "/fields/Microsoft.VSTS.Common.AcceptanceCriteria", value: markdownToHtml(item.acceptanceCriteria) });
  }
  if (item.areaPath) {
    ops.push({ op: "add", path: "/fields/System.AreaPath", value: item.areaPath });
  }
  if (item.iterationPath) {
    ops.push({ op: "add", path: "/fields/System.IterationPath", value: item.iterationPath });
  }
  if (item.assignedTo) {
    ops.push({ op: "add", path: "/fields/System.AssignedTo", value: item.assignedTo });
  }
  if (item.tags) {
    ops.push({ op: "add", path: "/fields/System.Tags", value: item.tags });
  }
  if (item.priority !== undefined) {
    ops.push({ op: "add", path: "/fields/Microsoft.VSTS.Common.Priority", value: item.priority });
  }
  if (item.storyPoints !== undefined) {
    ops.push({ op: "add", path: "/fields/Microsoft.VSTS.Scheduling.StoryPoints", value: item.storyPoints });
  }
  if (item.parentId) {
    ops.push({
      op: "add",
      path: "/relations/-",
      value: {
        rel: "System.LinkTypes.Hierarchy-Reverse",
        url: `${orgUrl}/_apis/wit/workitems/${item.parentId}`,
        attributes: { comment: "" },
      },
    });
  }

  return ops;
}

async function createWorkItem(
  client: AxiosInstance,
  orgUrl: string,
  item: WorkItemCreate
): Promise<{ id: number; url: string }> {
  const ops = buildPatchOps(item, orgUrl);
  const typeSegment = encodeURIComponent(`$${item.type}`);
  const { data } = await client.patch(
    `/wit/workitems/${typeSegment}?api-version=7.1`,
    ops,
    { headers: { "Content-Type": "application/json-patch+json" } }
  );
  return { id: data.id, url: data._links?.html?.href ?? "" };
}

export function registerWorkItemTools(
  server: McpServer,
  getClient: () => AxiosInstance,
  getOrgUrl: () => string
): void {
  server.tool(
    "ado_create_work_item",
    "Create a single work item in Azure DevOps",
    {
      type: z.string().describe("Work item type: Epic, Feature, User Story, Task, Bug"),
      title: z.string().describe("Work item title"),
      description: z.string().optional().describe("Description (markdown)"),
      acceptance_criteria: z.string().optional().describe("Acceptance criteria (markdown)"),
      area_path: z.string().optional().describe("Area path override"),
      iteration_path: z.string().optional().describe("Iteration/Sprint path"),
      parent_id: z.number().optional().describe("Parent work item ID"),
      assigned_to: z.string().optional().describe("Assignee display name or email"),
      tags: z.string().optional().describe("Semicolon-separated tags"),
      priority: z.number().optional().describe("Priority: 1=Critical 2=High 3=Medium 4=Low"),
      story_points: z.number().optional().describe("Story points / effort estimate"),
    },
    async ({ type, title, description, acceptance_criteria, area_path, iteration_path, parent_id, assigned_to, tags, priority, story_points }) => {
      return callAdo(async () => {
        const result = await createWorkItem(getClient(), getOrgUrl(), {
          type, title, description,
          areaPath: area_path, iterationPath: iteration_path,
          parentId: parent_id, assignedTo: assigned_to,
          tags, acceptanceCriteria: acceptance_criteria, priority,
          storyPoints: story_points,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      });
    }
  );

  server.tool(
    "ado_bulk_create_work_items",
    "Create multiple work items from an ALM extract payload, preserving parent-child hierarchy. Items must be ordered parents before children. Use ref/parentRef to wire up relationships.",
    {
      items: z.array(z.object({
        ref: z.string().optional().describe("Local reference key for parent-child linking"),
        parentRef: z.string().optional().describe("ref of the parent item in this batch"),
        type: z.string().describe("Work item type"),
        title: z.string().describe("Title"),
        description: z.string().optional(),
        acceptance_criteria: z.string().optional(),
        priority: z.number().optional(),
        story_points: z.number().optional(),
        tags: z.string().optional(),
        area_path: z.string().optional(),
        iteration_path: z.string().optional(),
        assigned_to: z.string().optional(),
      })).describe("Ordered list of work items — parents before children"),
    },
    async ({ items }) => {
      return callAdo(async () => {
        const client = getClient();
        const orgUrl = getOrgUrl();
        const refToId: Record<string, number> = {};
        const results: Array<{ ref?: string; id: number; title: string; url: string }> = [];
        const errors: Array<{ ref?: string; title: string; error: string }> = [];

        for (const item of items) {
          try {
            const parentId = item.parentRef ? refToId[item.parentRef] : undefined;
            const result = await createWorkItem(client, orgUrl, {
              type: item.type,
              title: item.title,
              description: item.description,
              acceptanceCriteria: item.acceptance_criteria,
              priority: item.priority,
              storyPoints: item.story_points,
              tags: item.tags,
              areaPath: item.area_path,
              iterationPath: item.iteration_path,
              assignedTo: item.assigned_to,
              parentId,
            });
            if (item.ref) refToId[item.ref] = result.id;
            results.push({ ref: item.ref, id: result.id, title: item.title, url: result.url });
          } catch (err: unknown) {
            errors.push({ ref: item.ref, title: item.title, error: err instanceof Error ? err.message : String(err) });
          }
        }

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ created: results.length, failed: errors.length, items: results, errors }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_get_work_item",
    "Get a work item by ID with full field expansion",
    {
      id: z.number().describe("Work item ID"),
    },
    async ({ id }) => {
      return callAdo(async () => {
        const { data } = await getClient().get(`/wit/workitems/${id}?api-version=7.1&$expand=relations`);
        const fields = data.fields as Record<string, unknown>;
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              id: data.id,
              type: fields["System.WorkItemType"],
              title: fields["System.Title"],
              state: fields["System.State"],
              assignedTo: (fields["System.AssignedTo"] as { displayName?: string } | undefined)?.displayName,
              areaPath: fields["System.AreaPath"],
              iterationPath: fields["System.IterationPath"],
              priority: fields["Microsoft.VSTS.Common.Priority"],
              storyPoints: fields["Microsoft.VSTS.Scheduling.StoryPoints"],
              url: data._links?.html?.href,
              relations: ((data.relations as Array<{ rel: string; url: string }>) ?? []).map((r) => ({
                rel: r.rel,
                id: r.url.split("/").pop(),
              })),
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_get_work_items_batch",
    "Get multiple work items by IDs in a single request (max 200 per call)",
    {
      ids: z.array(z.number()).describe("Work item IDs to fetch (max 200)"),
      fields: z.array(z.string()).optional().describe("Specific fields to return (default: Id, Title, Type, State, Parent, AreaPath, IterationPath, Priority, StoryPoints)"),
    },
    async ({ ids, fields }) => {
      return callAdo(async () => {
        const fieldList = (fields ?? [
          "System.Id", "System.Title", "System.WorkItemType", "System.State",
          "System.Parent", "System.AreaPath", "System.IterationPath",
          "Microsoft.VSTS.Common.Priority", "Microsoft.VSTS.Scheduling.StoryPoints",
        ]).join(",");

        const batch = ids.slice(0, 200);
        const { data } = await getClient().get(
          `/wit/workitems?ids=${batch.join(",")}&fields=${fieldList}&api-version=7.1`
        );

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              count: (data.value as unknown[]).length,
              items: (data.value as Array<{ id: number; fields: Record<string, unknown> }>).map((w) => ({
                id: w.id,
                type: w.fields["System.WorkItemType"],
                title: w.fields["System.Title"],
                state: w.fields["System.State"],
                parent: w.fields["System.Parent"],
                areaPath: w.fields["System.AreaPath"],
                iterationPath: w.fields["System.IterationPath"],
                priority: w.fields["Microsoft.VSTS.Common.Priority"],
                storyPoints: w.fields["Microsoft.VSTS.Scheduling.StoryPoints"],
              })),
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_update_work_item",
    "Update fields on an existing work item",
    {
      id: z.number().describe("Work item ID to update"),
      title: z.string().optional(),
      state: z.string().optional().describe("New state (e.g. Active, Resolved, Closed)"),
      assigned_to: z.string().optional(),
      tags: z.string().optional(),
      description: z.string().optional(),
      area_path: z.string().optional(),
      iteration_path: z.string().optional(),
      story_points: z.number().optional(),
      priority: z.number().optional(),
    },
    async ({ id, title, state, assigned_to, tags, description, area_path, iteration_path, story_points, priority }) => {
      return callAdo(async () => {
        const ops: object[] = [];
        if (title) ops.push({ op: "replace", path: "/fields/System.Title", value: title });
        if (state) ops.push({ op: "replace", path: "/fields/System.State", value: state });
        if (assigned_to) ops.push({ op: "replace", path: "/fields/System.AssignedTo", value: assigned_to });
        if (tags) ops.push({ op: "replace", path: "/fields/System.Tags", value: tags });
        if (description) ops.push({ op: "replace", path: "/fields/System.Description", value: markdownToHtml(description) });
        if (area_path) ops.push({ op: "replace", path: "/fields/System.AreaPath", value: area_path });
        if (iteration_path) ops.push({ op: "replace", path: "/fields/System.IterationPath", value: iteration_path });
        if (story_points !== undefined) ops.push({ op: "replace", path: "/fields/Microsoft.VSTS.Scheduling.StoryPoints", value: story_points });
        if (priority !== undefined) ops.push({ op: "replace", path: "/fields/Microsoft.VSTS.Common.Priority", value: priority });

        if (ops.length === 0) {
          return { content: [{ type: "text" as const, text: "No fields to update." }] };
        }

        const { data } = await getClient().patch(
          `/wit/workitems/${id}?api-version=7.1`,
          ops,
          { headers: { "Content-Type": "application/json-patch+json" } }
        );

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              id: data.id,
              state: (data.fields as Record<string, unknown>)["System.State"],
              updatedFields: ops.length,
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_batch_update_field",
    "Update the same field to the same value across multiple work items in one operation. Useful for bulk sprint assignment.",
    {
      ids: z.array(z.number()).describe("Work item IDs to update"),
      field: z.string().describe("ADO field reference name, e.g. System.IterationPath or System.State"),
      value: z.string().describe("New value for the field"),
    },
    async ({ ids, field, value }) => {
      return callAdo(async () => {
        const client = getClient();
        const ops = [{ op: "replace", path: `/fields/${field}`, value }];
        const headers = { "Content-Type": "application/json-patch+json" };

        const results = await Promise.allSettled(
          ids.map((id) =>
            client.patch(`/wit/workitems/${id}?api-version=7.1`, ops, { headers })
              .then((r) => ({ id, success: true, newValue: (r.data.fields as Record<string, unknown>)[field] }))
          )
        );

        const updated = results.filter((r) => r.status === "fulfilled").map((r) => (r as PromiseFulfilledResult<{ id: number; success: boolean; newValue: unknown }>).value);
        const failed = results
          .map((r, i) => r.status === "rejected" ? { id: ids[i], error: (r as PromiseRejectedResult).reason?.message } : null)
          .filter(Boolean);

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ field, value, updated: updated.length, failed: failed.length, items: updated, errors: failed }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_delete_work_item",
    "Permanently delete a work item from Azure DevOps. This action cannot be undone.",
    {
      id: z.number().describe("Work item ID to delete"),
      destroy: z.boolean().optional().describe("Permanently destroy (true) or move to recycle bin (false, default)"),
    },
    async ({ id, destroy }) => {
      return callAdo(async () => {
        await getClient().delete(
          `/wit/workitems/${id}?destroy=${destroy ?? false}&api-version=7.1`
        );
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ deleted: id, permanent: destroy ?? false }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_workitem_add_comment",
    "Add a comment to a work item",
    {
      id: z.number().describe("Work item ID"),
      text: z.string().describe("Comment text (supports HTML)"),
    },
    async ({ id, text }) => {
      return callAdo(async () => {
        const { data } = await getClient().post(
          `/wit/workitems/${id}/comments?api-version=7.1-preview.3`,
          { text }
        );
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ commentId: data.id, workItemId: id, text: data.text }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_workitem_get_comments",
    "Get all comments on a work item",
    {
      id: z.number().describe("Work item ID"),
    },
    async ({ id }) => {
      return callAdo(async () => {
        const { data } = await getClient().get(
          `/wit/workitems/${id}/comments?api-version=7.1-preview.3`
        );
        type Comment = { id: number; text: string; createdDate: string; createdBy: { displayName: string } };
        const comments = (data.comments as Comment[]) ?? [];
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              workItemId: id,
              count: comments.length,
              comments: comments.map((c) => ({
                id: c.id,
                text: c.text,
                createdBy: c.createdBy?.displayName,
                createdDate: c.createdDate,
              })),
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_workitem_get_history",
    "Get the revision history of a work item — shows what fields changed and when",
    {
      id: z.number().describe("Work item ID"),
      top: z.number().optional().describe("Maximum revisions to return (default 20, newest first)"),
    },
    async ({ id, top }) => {
      return callAdo(async () => {
        const { data } = await getClient().get(
          `/wit/workitems/${id}/revisions?$top=${top ?? 20}&api-version=7.1`
        );
        type Revision = { rev: number; fields: Record<string, unknown>; revisedDate: string; revisedBy: { displayName: string } };
        const revisions = ((data.value as Revision[]) ?? []).reverse();
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              workItemId: id,
              count: revisions.length,
              revisions: revisions.map((r) => ({
                rev: r.rev,
                changedBy: r.revisedBy?.displayName,
                changedDate: r.revisedDate,
                state: r.fields["System.State"],
                title: r.fields["System.Title"],
                iterationPath: r.fields["System.IterationPath"],
              })),
            }, null, 2),
          }],
        };
      });
    }
  );
}
