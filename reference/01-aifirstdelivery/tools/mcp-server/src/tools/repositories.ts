import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import { callAdo, createOrgClient, getAdoConfig } from "../utils/ado-client.js";

export function registerRepositoryTools(
  server: McpServer,
  getClient: () => AxiosInstance
): void {
  server.tool(
    "ado_repo_list",
    "List all Git repositories in the Azure DevOps project",
    {},
    async () => {
      return callAdo(async () => {
        const { data } = await getClient().get("/git/repositories?api-version=7.1");
        const repos = (data.value as Array<{
          id: string; name: string; defaultBranch?: string;
          remoteUrl: string; webUrl: string;
        }>) ?? [];

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              count: repos.length,
              repositories: repos.map((r) => ({
                id: r.id,
                name: r.name,
                defaultBranch: r.defaultBranch,
                remoteUrl: r.remoteUrl,
                webUrl: r.webUrl,
              })),
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_repo_create_pr",
    "Create a Pull Request in an Azure DevOps Git repository",
    {
      repo_name: z.string().describe("Repository name or GUID"),
      source_branch: z.string().describe("Source branch name (e.g. feature/my-feature or refs/heads/feature/my-feature)"),
      target_branch: z.string().optional().describe("Target branch (default: main)"),
      title: z.string().describe("PR title"),
      description: z.string().optional().describe("PR description (markdown)"),
      work_item_ids: z.array(z.number()).optional().describe("Work item IDs to link to this PR"),
      auto_complete: z.boolean().optional().describe("Enable auto-complete when all policies pass"),
      draft: z.boolean().optional().describe("Create as draft PR"),
    },
    async ({ repo_name, source_branch, target_branch, title, description, work_item_ids, auto_complete, draft }) => {
      return callAdo(async () => {
        const client = getClient();

        const toRef = (branch: string) =>
          branch.startsWith("refs/") ? branch : `refs/heads/${branch}`;

        const body: Record<string, unknown> = {
          title,
          sourceRefName: toRef(source_branch),
          targetRefName: toRef(target_branch ?? "main"),
          isDraft: draft ?? false,
        };

        if (description) body.description = description;

        if (work_item_ids && work_item_ids.length > 0) {
          body.workItemRefs = work_item_ids.map((id) => ({ id: String(id) }));
        }

        const { data } = await client.post(
          `/git/repositories/${encodeURIComponent(repo_name)}/pullrequests?api-version=7.1`,
          body
        );

        // Enable auto-complete if requested
        if (auto_complete && data.pullRequestId) {
          await client.patch(
            `/git/repositories/${encodeURIComponent(repo_name)}/pullrequests/${data.pullRequestId}?api-version=7.1`,
            {
              autoCompleteSetBy: { id: data.createdBy?.id },
              completionOptions: { mergeStrategy: "squash", deleteSourceBranch: true },
            }
          ).catch(() => { /* non-fatal — PR created successfully */ });
        }

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              pullRequestId: data.pullRequestId,
              title: data.title,
              status: data.status,
              sourceRef: data.sourceRefName,
              targetRef: data.targetRefName,
              isDraft: data.isDraft,
              url: data._links?.web?.href,
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_repo_get_pr",
    "Get details of a Pull Request including status and reviewer decisions",
    {
      repo_name: z.string().describe("Repository name or GUID"),
      pr_id: z.number().describe("Pull Request ID"),
    },
    async ({ repo_name, pr_id }) => {
      return callAdo(async () => {
        const { data } = await getClient().get(
          `/git/repositories/${encodeURIComponent(repo_name)}/pullrequests/${pr_id}?api-version=7.1`
        );

        type Reviewer = { displayName: string; vote: number };
        const voteLabel = (vote: number): string => {
          if (vote === 10) return "approved";
          if (vote === 5) return "approved-with-suggestions";
          if (vote === -5) return "waiting-for-author";
          if (vote === -10) return "rejected";
          return "no-vote";
        };

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              pullRequestId: data.pullRequestId,
              title: data.title,
              description: data.description,
              status: data.status,           // active | completed | abandoned
              isDraft: data.isDraft,
              sourceRef: data.sourceRefName,
              targetRef: data.targetRefName,
              createdBy: (data.createdBy as { displayName: string })?.displayName,
              creationDate: data.creationDate,
              closedDate: data.closedDate,
              mergeStatus: data.mergeStatus,
              reviewers: ((data.reviewers as Reviewer[]) ?? []).map((r) => ({
                name: r.displayName,
                vote: voteLabel(r.vote),
              })),
              url: data._links?.web?.href,
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_workitem_link_to_pr",
    "Link a work item to a Pull Request so it appears in the Development section of the work item",
    {
      work_item_id: z.number().describe("Work item ID to link"),
      repo_name: z.string().describe("Repository name"),
      pr_id: z.number().describe("Pull Request ID"),
    },
    async ({ work_item_id, repo_name, pr_id }) => {
      return callAdo(async () => {
        const client = getClient();

        // Resolve the repository GUID (needed for the artifact link URL)
        const { data: repoData } = await client.get(
          `/git/repositories/${encodeURIComponent(repo_name)}?api-version=7.1`
        );
        const repoId: string = repoData.id;

        // Resolve the project GUID via org-level API
        const config = getAdoConfig();
        const orgClient = createOrgClient(config);
        const { data: projectData } = await orgClient.get(
          `/projects/${encodeURIComponent(config.project)}?api-version=7.1`
        );
        const projectId: string = projectData.id;

        // Build the artifact link URL — this wires the PR into the work item's Development section
        const artifactUrl = `vstfs:///Git/PullRequestId/${projectId}/${repoId}/${pr_id}`;

        const ops = [{
          op: "add",
          path: "/relations/-",
          value: {
            rel: "ArtifactLink",
            url: artifactUrl,
            attributes: { name: "Pull Request" },
          },
        }];

        await client.patch(
          `/wit/workitems/${work_item_id}?api-version=7.1`,
          ops,
          { headers: { "Content-Type": "application/json-patch+json" } }
        );

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              workItemId: work_item_id,
              linkedPr: pr_id,
              repo: repo_name,
              artifactUrl,
            }, null, 2),
          }],
        };
      });
    }
  );
}
