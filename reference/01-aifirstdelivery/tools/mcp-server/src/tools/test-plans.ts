import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import { buildTestStepsXml, markdownToHtml, callAdo } from "../utils/ado-client.js";

export function registerTestPlanTools(
  server: McpServer,
  getClient: () => AxiosInstance,
  getOrgUrl: () => string
): void {
  server.tool(
    "ado_create_test_plan",
    "Create a test plan in Azure DevOps Test Plans",
    {
      name: z.string().describe("Test plan name"),
      area_path: z.string().optional().describe("Area path"),
      iteration: z.string().optional().describe("Iteration path"),
      start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      end_date: z.string().optional().describe("End date (YYYY-MM-DD)"),
    },
    async ({ name, area_path, iteration, start_date, end_date }) => {
      return callAdo(async () => {
        const body: Record<string, unknown> = { name };
        if (area_path) body.areaPath = area_path;
        if (iteration) body.iteration = iteration;
        if (start_date) body.startDate = start_date;
        if (end_date) body.endDate = end_date;

        const { data } = await getClient().post(`/testplan/plans?api-version=7.1`, body);
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ id: data.id, name: data.name, rootSuiteId: data.rootSuite?.id }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_create_test_suite",
    "Create a static test suite within an existing test plan",
    {
      plan_id: z.number().describe("Test plan ID"),
      name: z.string().describe("Suite name"),
      parent_suite_id: z.number().optional().describe("Parent suite ID (defaults to root suite)"),
    },
    async ({ plan_id, name, parent_suite_id }) => {
      return callAdo(async () => {
        let parentId = parent_suite_id;
        if (!parentId) {
          const { data: plan } = await getClient().get(`/testplan/plans/${plan_id}?api-version=7.1`);
          parentId = plan.rootSuite.id as number;
        }

        const { data } = await getClient().post(
          `/testplan/plans/${plan_id}/suites?api-version=7.1`,
          { name, suiteType: "staticTestSuite", parentSuite: { id: parentId } }
        );
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ id: data.value?.[0]?.id ?? data.id, name }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_create_test_case",
    "Create a test case work item with structured steps",
    {
      title: z.string().describe("Test case title"),
      steps: z.array(z.object({
        step: z.number().describe("Step number"),
        action: z.string().describe("Action to perform"),
        expected: z.string().describe("Expected result"),
      })).describe("Test steps array"),
      area_path: z.string().optional(),
      priority: z.number().optional().describe("1=Critical 2=High 3=Medium 4=Low"),
      assigned_to: z.string().optional(),
      automation_status: z.string().optional().describe("Planned | Automated | Not Automated"),
    },
    async ({ title, steps, area_path, priority, assigned_to, automation_status }) => {
      return callAdo(async () => {
        const stepsXml = buildTestStepsXml(steps);
        const ops: object[] = [
          { op: "add", path: "/fields/System.Title", value: title },
          { op: "add", path: "/fields/Microsoft.VSTS.TCM.Steps", value: stepsXml },
        ];
        if (area_path) ops.push({ op: "add", path: "/fields/System.AreaPath", value: area_path });
        if (priority) ops.push({ op: "add", path: "/fields/Microsoft.VSTS.Common.Priority", value: priority });
        if (assigned_to) ops.push({ op: "add", path: "/fields/System.AssignedTo", value: assigned_to });
        if (automation_status) {
          ops.push({ op: "add", path: "/fields/Microsoft.VSTS.TCM.AutomationStatus", value: automation_status });
        }

        const { data } = await getClient().patch(
          `/wit/workitems/${encodeURIComponent("$Test Case")}?api-version=7.1`,
          ops,
          { headers: { "Content-Type": "application/json-patch+json" } }
        );

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ id: data.id, title, url: data._links?.html?.href }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_add_test_case_to_suite",
    "Add an existing test case work item to a test suite",
    {
      plan_id: z.number().describe("Test plan ID"),
      suite_id: z.number().describe("Test suite ID"),
      test_case_ids: z.array(z.number()).describe("One or more test case work item IDs"),
    },
    async ({ plan_id, suite_id, test_case_ids }) => {
      return callAdo(async () => {
        await getClient().post(
          `/testplan/plans/${plan_id}/suites/${suite_id}/testcase?api-version=7.1`,
          test_case_ids.map((id) => ({ workItem: { id } }))
        );
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ added: test_case_ids.length, suiteId: suite_id, testCaseIds: test_case_ids }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_get_test_plan",
    "Get test plan details including all suites",
    {
      plan_id: z.number().describe("Test plan ID"),
    },
    async ({ plan_id }) => {
      return callAdo(async () => {
        const [planResp, suitesResp] = await Promise.all([
          getClient().get(`/testplan/plans/${plan_id}?api-version=7.1`),
          getClient().get(`/testplan/plans/${plan_id}/suites?api-version=7.1`),
        ]);
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              id: planResp.data.id,
              name: planResp.data.name,
              state: planResp.data.state,
              rootSuiteId: planResp.data.rootSuite?.id,
              suites: (suitesResp.data.value as Array<{ id: number; name: string; suiteType: string }> ?? []).map((s) => ({
                id: s.id,
                name: s.name,
                type: s.suiteType,
              })),
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_get_test_suite_cases",
    "Get all test cases within a specific test suite",
    {
      plan_id: z.number().describe("Test plan ID"),
      suite_id: z.number().describe("Test suite ID"),
    },
    async ({ plan_id, suite_id }) => {
      return callAdo(async () => {
        const { data } = await getClient().get(
          `/testplan/plans/${plan_id}/suites/${suite_id}/testcase?api-version=7.1`
        );
        type TC = { workItem: { id: number; name: string }; pointAssignments: Array<{ tester?: { displayName: string } }> };
        const cases = (data.value as TC[]) ?? [];
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              planId: plan_id,
              suiteId: suite_id,
              count: cases.length,
              testCases: cases.map((tc) => ({
                id: tc.workItem.id,
                title: tc.workItem.name,
                tester: tc.pointAssignments?.[0]?.tester?.displayName,
              })),
            }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_bulk_create_test_suite",
    "Create a test plan with multiple suites and test cases in one operation. Returns planId, suiteMap and tcMap for sync-back.",
    {
      plan_name: z.string().describe("Test plan name"),
      area_path: z.string().optional(),
      iteration: z.string().optional(),
      suites: z.array(z.object({
        name: z.string().describe("Suite name"),
        test_cases: z.array(z.object({
          tc_id: z.string().describe("Local TC ID e.g. TC-CRM-SI-001 — returned in result for sync"),
          title: z.string(),
          steps: z.array(z.object({
            step: z.number(),
            action: z.string(),
            expected: z.string(),
          })),
          priority: z.number().optional(),
        })),
      })).describe("Suites with their test cases"),
    },
    async ({ plan_name, area_path, iteration, suites }) => {
      return callAdo(async () => {
        const client = getClient();
        const planBody: Record<string, unknown> = { name: plan_name };
        if (area_path) planBody.areaPath = area_path;
        if (iteration) planBody.iteration = iteration;

        const { data: plan } = await client.post(`/testplan/plans?api-version=7.1`, planBody);
        const planId: number = plan.id as number;
        const rootSuiteId: number = plan.rootSuite.id as number;

        const suiteMap: Record<string, number> = {};
        const tcMap: Record<string, number> = {};

        for (const suite of suites) {
          const { data: suiteData } = await client.post(
            `/testplan/plans/${planId}/suites?api-version=7.1`,
            { name: suite.name, suiteType: "staticTestSuite", parentSuite: { id: rootSuiteId } }
          );
          const suiteId: number = (suiteData.value?.[0]?.id ?? suiteData.id) as number;
          suiteMap[suite.name] = suiteId;

          for (const tc of suite.test_cases) {
            const stepsXml = buildTestStepsXml(tc.steps);
            const ops: object[] = [
              { op: "add", path: "/fields/System.Title", value: tc.title },
              { op: "add", path: "/fields/Microsoft.VSTS.TCM.Steps", value: stepsXml },
            ];
            if (area_path) ops.push({ op: "add", path: "/fields/System.AreaPath", value: area_path });
            if (tc.priority) ops.push({ op: "add", path: "/fields/Microsoft.VSTS.Common.Priority", value: tc.priority });

            const { data: tcData } = await client.patch(
              `/wit/workitems/${encodeURIComponent("$Test Case")}?api-version=7.1`,
              ops,
              { headers: { "Content-Type": "application/json-patch+json" } }
            );
            const tcAdoId: number = tcData.id as number;
            tcMap[tc.tc_id] = tcAdoId;

            await client.post(
              `/testplan/plans/${planId}/suites/${suiteId}/testcase?api-version=7.1`,
              [{ workItem: { id: tcAdoId } }]
            );
          }
        }

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ planId, rootSuiteId, suiteMap, tcMap }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_delete_test_plan",
    "Delete a test plan and all its suites. Test case work items are NOT deleted — use ado_delete_work_item for each case if needed.",
    {
      plan_id: z.number().describe("Test plan ID to delete"),
    },
    async ({ plan_id }) => {
      return callAdo(async () => {
        await getClient().delete(`/testplan/plans/${plan_id}?api-version=7.1`);
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ deleted: { planId: plan_id } }, null, 2),
          }],
        };
      });
    }
  );

  server.tool(
    "ado_delete_test_suite",
    "Delete a test suite. Test case work items within it are NOT deleted.",
    {
      plan_id: z.number().describe("Test plan ID"),
      suite_id: z.number().describe("Test suite ID to delete"),
    },
    async ({ plan_id, suite_id }) => {
      return callAdo(async () => {
        await getClient().delete(
          `/testplan/plans/${plan_id}/suites/${suite_id}?api-version=7.1`
        );
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ deleted: { planId: plan_id, suiteId: suite_id } }, null, 2),
          }],
        };
      });
    }
  );
}
