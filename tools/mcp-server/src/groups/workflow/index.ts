/**
 * workflow tool group — DAG navigation backed by per-feature .workflow.json + root workflow.yaml.
 *
 * Tools:
 *   - workflow_status   — read .workflow.json; return phase, gates, dependencies, recent history
 *   - workflow_next     — compute eligible transitions from current state
 *   - workflow_advance  — update .workflow.json after a successful command (used by hooks)
 */

import type { RegisteredTool } from "../../index.js";
import { readJson, readYaml, writeJson } from "../../lib/file-utils.js";
import { projectFeatureRoot, repoPath, projectsRoot, isDir, isFile } from "../../lib/repo-paths.js";
import { validate, formatErrors } from "../../lib/schema-validate.js";
import { log } from "../../lib/logger.js";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

type WorkflowYaml = {
  version: number;
  phases: Array<{ name: string; states: string[] }>;
  transitions: Record<string, { command: string; gate?: boolean; conditional?: string }>;
  "hard-gates": string[];
  "parallel-after": Record<string, string[]>;
};

type WorkflowState = {
  schemaVersion: string;
  project: string;
  agent: string;
  feature: string;
  phase: string;
  currentStates: string[];
  gates: Record<string, { status: string; ts?: string; by?: string; notes?: string }>;
  dependencies?: Array<{
    agent: string;
    feature: string;
    artifact: string;
    status: string;
  }>;
  history?: Array<{ command: string; ts: string; result: string; notes?: string }>;
};

let cachedWorkflow: WorkflowYaml | null = null;

function loadWorkflowYaml(): WorkflowYaml {
  if (cachedWorkflow) return cachedWorkflow;
  cachedWorkflow = readYaml<WorkflowYaml>(repoPath("workflow.yaml"));
  return cachedWorkflow;
}

function workflowStatePath(project: string, agent: string, feature: string): string {
  return join(projectFeatureRoot(project, agent, feature), ".workflow.json");
}

function loadWorkflowState(project: string, agent: string, feature: string): WorkflowState {
  const p = workflowStatePath(project, agent, feature);
  if (!existsSync(p)) {
    throw new Error(`No .workflow.json found at ${p}. Run New-Feature.ps1 to scaffold.`);
  }
  const raw = readJson<WorkflowState>(p);
  const result = validate("workflow-state.v1.json", raw);
  if (!result.valid) {
    throw new Error(
      `Invalid .workflow.json at ${p}:\n${formatErrors(result.errors)}`
    );
  }
  return raw;
}

function saveWorkflowState(state: WorkflowState): void {
  const result = validate("workflow-state.v1.json", state);
  if (!result.valid) {
    throw new Error(`Refusing to save invalid .workflow.json:\n${formatErrors(result.errors)}`);
  }
  writeJson(workflowStatePath(state.project, state.agent, state.feature), state);
}

function computeEligibleTransitions(state: WorkflowState, wf: WorkflowYaml): Array<{
  fromState: string;
  toState: string;
  command: string;
  isGate: boolean;
  blockedBy: string | null;
}> {
  const eligible: Array<{
    fromState: string;
    toState: string;
    command: string;
    isGate: boolean;
    blockedBy: string | null;
  }> = [];

  for (const [edgeKey, edgeMeta] of Object.entries(wf.transitions)) {
    const [from, to] = edgeKey.split("->").map((s) => s.trim());
    if (!state.currentStates.includes(from)) continue;

    // Check hard-gate prerequisites
    const blockedBy = checkGatePrereqs(from, wf, state);
    eligible.push({
      fromState: from,
      toState: to,
      command: edgeMeta.command,
      isGate: edgeMeta.gate === true,
      blockedBy,
    });
  }
  return eligible;
}

function checkGatePrereqs(toState: string, wf: WorkflowYaml, state: WorkflowState): string | null {
  // For known hard gates downstream of `toState`, ensure prior gates are APPROVED.
  // Simplified: hard gates fire IN ORDER; SPEC_APPROVED < PLAN_CLARIFIED < TASK_VALIDATED.
  // We just check that anything we're transitioning FROM has its prior gates approved.
  const order = wf["hard-gates"];
  const targetIdx = order.indexOf(toState);
  if (targetIdx === -1) return null;
  for (let i = 0; i < targetIdx; i++) {
    const priorGate = order[i];
    const status = state.gates[priorGate]?.status;
    if (status !== "APPROVED" && status !== "FORCE_SKIPPED") {
      return `hard gate '${priorGate}' is ${status ?? "PENDING"}`;
    }
  }
  return null;
}

export function registerWorkflow(): RegisteredTool[] {
  return [
    {
      tool: {
        name: "workflow_status",
        description:
          "Read a feature's .workflow.json. Returns current phase, active states, gate matrix, declared cross-agent dependencies, and recent command history.",
        inputSchema: {
          type: "object",
          properties: {
            project: { type: "string" },
            agent: { type: "string" },
            feature: { type: "string" },
          },
          required: ["project", "agent", "feature"],
        },
      },
      handler: async (args) => {
        const project = String(args.project);
        const agent = String(args.agent);
        const feature = String(args.feature);
        const state = loadWorkflowState(project, agent, feature);
        return {
          content: [
            {
              type: "text" as const,
              text: formatStatus(state),
            },
          ],
        };
      },
    },

    {
      tool: {
        name: "workflow_next",
        description:
          "Compute the next eligible commands for a feature based on workflow.yaml + current .workflow.json. Returns ordered list with [BLOCKED] markers for transitions whose hard-gate prerequisites are unmet.",
        inputSchema: {
          type: "object",
          properties: {
            project: { type: "string" },
            agent: { type: "string" },
            feature: { type: "string" },
          },
          required: ["project", "agent", "feature"],
        },
      },
      handler: async (args) => {
        const project = String(args.project);
        const agent = String(args.agent);
        const feature = String(args.feature);
        const state = loadWorkflowState(project, agent, feature);
        const wf = loadWorkflowYaml();
        const eligible = computeEligibleTransitions(state, wf);
        return {
          content: [
            {
              type: "text" as const,
              text: formatNext(state, eligible),
            },
          ],
        };
      },
    },

    {
      tool: {
        name: "workflow_advance",
        description:
          "Update .workflow.json after a successful command: transition to the new state, set gate status if applicable, append to history. Validates the resulting state against workflow-state.v1.json.",
        inputSchema: {
          type: "object",
          properties: {
            project: { type: "string" },
            agent: { type: "string" },
            feature: { type: "string" },
            command: { type: "string", description: "The command that ran (e.g., '/review --approve')" },
            toState: { type: "string", description: "The new state to add to currentStates (e.g., 'SPEC_APPROVED')" },
            removeStates: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of states to remove from currentStates (e.g., remove SPEC_DRAFT after SPEC_APPROVED).",
            },
            gate: {
              type: "object",
              description: "Optional gate update.",
              properties: {
                name: { type: "string" },
                status: { enum: ["PENDING", "APPROVED", "REJECTED", "FORCE_SKIPPED"] },
                by: { type: "string" },
                notes: { type: "string" },
              },
              required: ["name", "status"],
            },
            result: { enum: ["ok", "failed", "force-skipped"], default: "ok" },
            notes: { type: "string" },
          },
          required: ["project", "agent", "feature", "command", "toState"],
        },
      },
      handler: async (args) => {
        const project = String(args.project);
        const agent = String(args.agent);
        const feature = String(args.feature);
        const command = String(args.command);
        const toState = String(args.toState);
        const removeStates = (args.removeStates as string[] | undefined) ?? [];
        const result = (args.result as string | undefined) ?? "ok";
        const notes = args.notes as string | undefined;
        const gate = args.gate as
          | { name: string; status: string; by?: string; notes?: string }
          | undefined;

        const state = loadWorkflowState(project, agent, feature);
        const wf = loadWorkflowYaml();

        // Determine phase from toState membership.
        let newPhase = state.phase;
        for (const ph of wf.phases) {
          if (ph.states.includes(toState)) {
            newPhase = ph.name;
            break;
          }
        }

        const newStates = state.currentStates.filter((s) => !removeStates.includes(s));
        if (!newStates.includes(toState)) newStates.push(toState);

        const newGates = { ...state.gates };
        if (gate) {
          newGates[gate.name] = {
            status: gate.status,
            ts: new Date().toISOString(),
            ...(gate.by ? { by: gate.by } : {}),
            ...(gate.notes ? { notes: gate.notes } : {}),
          };
        }

        const historyEntry = {
          command,
          ts: new Date().toISOString(),
          result,
          ...(notes ? { notes } : {}),
        };
        const newHistory = [...(state.history ?? []), historyEntry];

        const newState: WorkflowState = {
          ...state,
          phase: newPhase,
          currentStates: newStates,
          gates: newGates,
          history: newHistory,
        };

        saveWorkflowState(newState);
        log.info("workflow advanced", { project, agent, feature, toState, command });

        return {
          content: [
            {
              type: "text" as const,
              text:
                `Advanced ${project}/${agent}/${feature} to ${toState}.\n` +
                `  Phase: ${newPhase}\n` +
                `  Current states: ${newStates.join(", ")}\n` +
                (gate ? `  Gate '${gate.name}' = ${gate.status}\n` : "") +
                `  History entries: ${newHistory.length}`,
            },
          ],
        };
      },
    },

    {
      tool: {
        name: "workflow_list_features",
        description:
          "List all features across all agents in a project that have a .workflow.json (i.e., everything scaffolded by New-Feature.ps1). Returns project, agent, feature, phase, currentStates per row.",
        inputSchema: {
          type: "object",
          properties: {
            project: { type: "string" },
          },
          required: ["project"],
        },
      },
      handler: async (args) => {
        const project = String(args.project);
        const projectDir = repoPath("projects", project);
        if (!isDir(projectDir)) {
          return {
            content: [{ type: "text" as const, text: `Project not found: ${project}` }],
          };
        }
        const features: Array<{
          project: string;
          agent: string;
          feature: string;
          phase: string;
          currentStates: string[];
        }> = [];
        for (const agentEntry of readdirSync(projectDir)) {
          const agentFeaturesDir = join(projectDir, agentEntry, "features");
          if (!isDir(agentFeaturesDir)) continue;
          for (const feature of readdirSync(agentFeaturesDir)) {
            const wfPath = join(agentFeaturesDir, feature, ".workflow.json");
            if (isFile(wfPath)) {
              try {
                const st = readJson<WorkflowState>(wfPath);
                features.push({
                  project,
                  agent: agentEntry,
                  feature,
                  phase: st.phase,
                  currentStates: st.currentStates,
                });
              } catch (err) {
                log.warn("could not read .workflow.json", { path: wfPath, error: (err as Error).message });
              }
            }
          }
        }
        return {
          content: [
            {
              type: "text" as const,
              text:
                features.length === 0
                  ? `No features found in project '${project}'.`
                  : features
                      .map(
                        (f) =>
                          `${f.agent}/${f.feature} — phase=${f.phase}, states=[${f.currentStates.join(", ")}]`
                      )
                      .join("\n"),
            },
          ],
        };
      },
    },
  ];
}

function formatStatus(state: WorkflowState): string {
  const lines: string[] = [];
  lines.push(`Project: ${state.project} | Agent: ${state.agent} | Feature: ${state.feature}`);
  lines.push(`Phase: ${state.phase}`);
  lines.push(`Current states: ${state.currentStates.join(", ")}`);
  lines.push("");
  lines.push("Gates:");
  for (const [gateName, gateInfo] of Object.entries(state.gates)) {
    const ts = gateInfo.ts ? ` @ ${gateInfo.ts}` : "";
    const by = gateInfo.by ? ` by ${gateInfo.by}` : "";
    lines.push(`  ${gateName}: ${gateInfo.status}${ts}${by}`);
  }
  if (state.dependencies && state.dependencies.length > 0) {
    lines.push("");
    lines.push("Dependencies:");
    for (const dep of state.dependencies) {
      lines.push(`  ${dep.agent}/${dep.feature} ${dep.artifact}: ${dep.status}`);
    }
  }
  if (state.history && state.history.length > 0) {
    lines.push("");
    lines.push(`History (last 5 of ${state.history.length}):`);
    for (const h of state.history.slice(-5)) {
      lines.push(`  ${h.ts} — ${h.command} (${h.result})`);
    }
  }
  return lines.join("\n");
}

function formatNext(
  state: WorkflowState,
  eligible: ReturnType<typeof computeEligibleTransitions>
): string {
  const lines: string[] = [];
  lines.push(`Current states: ${state.currentStates.join(", ")} (phase=${state.phase})`);
  lines.push("");
  if (eligible.length === 0) {
    lines.push("(no eligible transitions — feature may be complete or in an invalid state)");
    return lines.join("\n");
  }
  lines.push("Eligible commands:");
  let idx = 1;
  for (const e of eligible) {
    const blocked = e.blockedBy ? `  [BLOCKED — ${e.blockedBy}]` : "";
    const gate = e.isGate ? " [GATE]" : "";
    lines.push(`  ${idx}. ${e.command}${gate}  →  ${e.toState}${blocked}`);
    idx++;
  }
  return lines.join("\n");
}

// Re-export for cross-group reads (avoids unused-import warning if not consumed yet).
export { loadWorkflowState, loadWorkflowYaml };
// Suppress unused-paths-import warning by exporting (used in future groups).
export const _internal = { projectsRoot };
