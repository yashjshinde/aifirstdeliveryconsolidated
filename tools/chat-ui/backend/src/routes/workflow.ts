import { Router } from "express";
import { promises as fs } from "node:fs";
import path from "node:path";

import { projectRoot, isFile, isDir } from "../lib/repo-paths.js";

export const workflowRouter = Router();

interface WorkflowState {
  schemaVersion?: string;
  project?: string;
  agent?: string;
  feature?: string;
  phase?: string;
  currentStates?: string[];
  gates?: Record<string, { status: string; ts?: string; by?: string }>;
  dependencies?: Array<{ agent: string; feature: string; artifact: string; status: string }>;
  history?: Array<{ command: string; ts: string; result: string }>;
}

/**
 * GET /api/workflow/status?project=p&agent=a&feature=f
 * Returns the .workflow.json for a feature.
 */
workflowRouter.get("/status", async (req, res) => {
  try {
    const project = String(req.query.project ?? "");
    const agent = String(req.query.agent ?? "");
    const feature = String(req.query.feature ?? "");
    if (!project || !agent || !feature) {
      res.status(400).json({ error: "Missing project / agent / feature query params." });
      return;
    }
    const wfPath = path.join(projectRoot(project), agent, "features", feature, ".workflow.json");
    if (!isFile(wfPath)) {
      res.status(404).json({ error: `No .workflow.json at projects/${project}/${agent}/features/${feature}/` });
      return;
    }
    const raw = await fs.readFile(wfPath, "utf-8");
    const state = JSON.parse(raw) as WorkflowState;
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/workflow/features?project=p&agent=a
 * Lists every feature folder under projects/{p}/{a}/features/.
 */
workflowRouter.get("/features", async (req, res) => {
  try {
    const project = String(req.query.project ?? "");
    const agent = String(req.query.agent ?? "");
    if (!project || !agent) {
      res.status(400).json({ error: "Missing project / agent query params." });
      return;
    }
    const fd = path.join(projectRoot(project), agent, "features");
    if (!isDir(fd)) {
      res.json({ features: [] });
      return;
    }
    const entries = await fs.readdir(fd, { withFileTypes: true });
    const features = entries
      .filter(e => e.isDirectory() && !e.name.startsWith("."))
      .map(e => e.name)
      .sort();
    res.json({ features });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/workflow/next?project=p&agent=a&feature=f
 *
 * v1 implementation: simple eligible-command computation from the .workflow.json
 * state + gates. Eventually should delegate to the MCP `workflow_next` tool via
 * a subprocess; for v1, we duplicate the lightweight logic here so the chat UI
 * doesn't require the MCP server to be running.
 */
workflowRouter.get("/next", async (req, res) => {
  try {
    const project = String(req.query.project ?? "");
    const agent = String(req.query.agent ?? "");
    const feature = String(req.query.feature ?? "");
    if (!project || !agent || !feature) {
      res.status(400).json({ error: "Missing project / agent / feature query params." });
      return;
    }
    const wfPath = path.join(projectRoot(project), agent, "features", feature, ".workflow.json");
    if (!isFile(wfPath)) {
      res.json({
        eligibleCommands: ["/spec"],
        rationale: "No .workflow.json exists yet; start with /spec.",
        gates: {},
        currentStates: [],
      });
      return;
    }
    const raw = await fs.readFile(wfPath, "utf-8");
    const state = JSON.parse(raw) as WorkflowState;
    const eligible = computeEligible(state);
    res.json({
      eligibleCommands: eligible,
      rationale: "Computed from .workflow.json currentStates + gates.",
      gates: state.gates ?? {},
      currentStates: state.currentStates ?? [],
      phase: state.phase,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

function computeEligible(state: WorkflowState): string[] {
  const cs = new Set(state.currentStates ?? []);
  const gates = state.gates ?? {};
  const eligible: string[] = [];

  // DEFINE
  if (cs.has("SPEC_DRAFT")) {
    eligible.push("/review");
  }
  if (cs.has("SPEC_REVIEWED")) {
    eligible.push("/review --approve");
  }
  if (gates.SPEC_APPROVED?.status === "APPROVED") {
    if (!cs.has("FDD_DRAFT")) eligible.push("/fdd");
    if (!cs.has("TEST_PLAN_DRAFT")) eligible.push("/test-plan");
    if (!cs.has("PLAN_DRAFT")) eligible.push("/plan");
    eligible.push("/split"); // always eligible after spec approved (optional)
  }
  // DESIGN
  if (cs.has("PLAN_DRAFT") && gates.PLAN_CLARIFIED?.status !== "APPROVED") {
    eligible.push("/clarify --approve");
  }
  if (gates.PLAN_CLARIFIED?.status === "APPROVED") {
    if (!cs.has("TDD_DRAFT")) eligible.push("/tdd");
    if (!cs.has("BLUEPRINT_DRAFT")) eligible.push("/blueprint");
    if (!cs.has("TASK_DRAFT")) eligible.push("/task");
  }
  // BUILD
  if (cs.has("TASK_DRAFT") && gates.TASK_VALIDATED?.status !== "APPROVED") {
    eligible.push("/validate --approve");
  }
  if (gates.TASK_VALIDATED?.status === "APPROVED" && !cs.has("IMPLEMENTING") && !cs.has("IMPLEMENTED")) {
    eligible.push("/implement");
  }
  if (cs.has("IMPLEMENTED") && !cs.has("DOCUMENTED")) {
    eligible.push("/document");
  }
  if (cs.has("DOCUMENTED")) {
    eligible.push("/alm-extract");
  }
  // utility
  eligible.push("/status");
  eligible.push("/next");

  return Array.from(new Set(eligible));
}
