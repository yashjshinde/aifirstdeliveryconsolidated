/**
 * handoff tool group — cross-agent coordination backed by projects/{p}/_handoffs/*.handoff.json.
 *
 * Tools:
 *   - handoff_list      — list all handoffs across agents for a project
 *   - handoff_status    — get one handoff by id
 *   - handoff_publish   — emit a new handoff manifest (validates against handoff.v1)
 *   - handoff_consume   — mark a handoff CONSUMED by a target agent
 *
 * See design/09-orchestration-patterns.md (Pattern 2 — federation handoff, Pattern 4 — aggregation)
 * and schemas/handoff.v1.json.
 */

import type { RegisteredTool } from "../../index.js";
import { readJson, writeJson } from "../../lib/file-utils.js";
import { projectRoot, repoPath, isDir, isFile } from "../../lib/repo-paths.js";
import { validate, formatErrors } from "../../lib/schema-validate.js";
import { log } from "../../lib/logger.js";
import { existsSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";

type HandoffEnvelope = {
  schemaVersion: string;
  id: string;
  project: string;
  sourceAgent: string;
  targetAgent: string;
  feature?: string;
  artifactType: string;
  status: string;
  payload?: Record<string, unknown>;
  created: string;
  createdBy?: string;
  consumed?: string;
  consumedBy?: string;
  notes?: string;
};

function handoffsDir(project: string): string {
  return join(projectRoot(project), "_handoffs");
}

function handoffPath(project: string, id: string): string {
  return join(handoffsDir(project), `${id}.handoff.json`);
}

function listAllHandoffs(project: string): HandoffEnvelope[] {
  const dir = handoffsDir(project);
  if (!isDir(dir)) return [];
  const out: HandoffEnvelope[] = [];
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith(".handoff.json")) continue;
    try {
      out.push(readJson<HandoffEnvelope>(join(dir, entry)));
    } catch (err) {
      log.warn("invalid handoff file, skipping", { file: entry, error: (err as Error).message });
    }
  }
  return out;
}

export function registerHandoff(): RegisteredTool[] {
  return [
    {
      tool: {
        name: "handoff_list",
        description:
          "List handoffs for a project. Optional filters: targetAgent, sourceAgent, status (PENDING/READY/CONSUMED/FAILED/WAIVED), feature, artifactType.",
        inputSchema: {
          type: "object",
          properties: {
            project: { type: "string" },
            targetAgent: { type: "string" },
            sourceAgent: { type: "string" },
            status: {
              enum: ["PENDING", "READY", "CONSUMED", "FAILED", "WAIVED"],
            },
            feature: { type: "string" },
            artifactType: { type: "string" },
          },
          required: ["project"],
        },
      },
      handler: async (args) => {
        const project = String(args.project);
        const targetAgent = args.targetAgent as string | undefined;
        const sourceAgent = args.sourceAgent as string | undefined;
        const status = args.status as string | undefined;
        const feature = args.feature as string | undefined;
        const artifactType = args.artifactType as string | undefined;

        const all = listAllHandoffs(project);
        const filtered = all.filter((h) => {
          if (targetAgent && h.targetAgent !== targetAgent) return false;
          if (sourceAgent && h.sourceAgent !== sourceAgent) return false;
          if (status && h.status !== status) return false;
          if (feature && h.feature !== feature) return false;
          if (artifactType && h.artifactType !== artifactType) return false;
          return true;
        });

        return {
          content: [
            {
              type: "text" as const,
              text:
                filtered.length === 0
                  ? `No handoffs match the filter in project '${project}' (total handoffs: ${all.length}).`
                  : filtered
                      .map(
                        (h) =>
                          `${h.id}: ${h.sourceAgent} → ${h.targetAgent} [${h.artifactType}] status=${h.status} feature=${h.feature ?? "-"}`
                      )
                      .join("\n") + `\n\nTotal matched: ${filtered.length} of ${all.length}.`,
            },
          ],
        };
      },
    },

    {
      tool: {
        name: "handoff_status",
        description: "Get one handoff by id with full payload details.",
        inputSchema: {
          type: "object",
          properties: {
            project: { type: "string" },
            id: { type: "string" },
          },
          required: ["project", "id"],
        },
      },
      handler: async (args) => {
        const project = String(args.project);
        const id = String(args.id);
        const path = handoffPath(project, id);
        if (!existsSync(path)) {
          return errorResult(`Handoff not found: ${id} (path: ${path})`);
        }
        const handoff = readJson<HandoffEnvelope>(path);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(handoff, null, 2) }],
        };
      },
    },

    {
      tool: {
        name: "handoff_publish",
        description:
          "Emit a new handoff manifest. Validates against handoff.v1 schema. Writes to projects/{project}/_handoffs/{id}.handoff.json. Returns the id.",
        inputSchema: {
          type: "object",
          properties: {
            project: { type: "string" },
            id: {
              type: "string",
              description: "Convention: {feature-slug}-{targetAgent}-{NNN}. Must be unique within the project.",
            },
            sourceAgent: {
              enum: ["d365-ce", "d365-fo", "integration", "reporting", "solution-estimate", "solution-architect", "brownfield", "alm"],
            },
            targetAgent: {
              enum: ["d365-ce", "d365-fo", "integration", "reporting", "solution-estimate", "solution-architect", "brownfield", "alm"],
            },
            feature: { type: "string" },
            artifactType: {
              enum: [
                "spec-split",
                "plan-dependency",
                "blueprint-aggregate",
                "alm-extract",
                "brownfield-inventory",
                "estimation-input",
              ],
            },
            payload: { type: "object" },
            createdBy: { type: "string" },
            notes: { type: "string" },
          },
          required: ["project", "id", "sourceAgent", "targetAgent", "artifactType"],
        },
      },
      handler: async (args) => {
        const project = String(args.project);
        const id = String(args.id);
        const path = handoffPath(project, id);
        if (existsSync(path)) {
          return errorResult(`Handoff already exists at ${path}. Choose a different id or delete first.`);
        }
        const handoff: HandoffEnvelope = {
          schemaVersion: "1.0",
          id,
          project,
          sourceAgent: String(args.sourceAgent),
          targetAgent: String(args.targetAgent),
          feature: args.feature as string | undefined,
          artifactType: String(args.artifactType),
          status: "READY",
          payload: (args.payload as Record<string, unknown> | undefined) ?? {},
          created: new Date().toISOString(),
          createdBy: (args.createdBy as string | undefined) ?? "mcp-handoff_publish",
          notes: args.notes as string | undefined,
        };
        const result = validate("handoff.v1.json", handoff);
        if (!result.valid) {
          return errorResult(`Schema validation failed:\n${formatErrors(result.errors)}`);
        }
        mkdirSync(handoffsDir(project), { recursive: true });
        writeJson(path, handoff);
        log.info("handoff published", { project, id, sourceAgent: handoff.sourceAgent, targetAgent: handoff.targetAgent });
        return {
          content: [
            {
              type: "text" as const,
              text: `Published handoff '${id}' at ${path}. status=READY.`,
            },
          ],
        };
      },
    },

    {
      tool: {
        name: "handoff_consume",
        description:
          "Mark a handoff CONSUMED by a target agent. Sets consumed timestamp + consumedBy + status=CONSUMED.",
        inputSchema: {
          type: "object",
          properties: {
            project: { type: "string" },
            id: { type: "string" },
            consumedBy: { type: "string" },
            notes: { type: "string" },
          },
          required: ["project", "id", "consumedBy"],
        },
      },
      handler: async (args) => {
        const project = String(args.project);
        const id = String(args.id);
        const consumedBy = String(args.consumedBy);
        const path = handoffPath(project, id);
        if (!isFile(path)) {
          return errorResult(`Handoff not found: ${id}`);
        }
        const handoff = readJson<HandoffEnvelope>(path);
        handoff.status = "CONSUMED";
        handoff.consumed = new Date().toISOString();
        handoff.consumedBy = consumedBy;
        if (args.notes) handoff.notes = String(args.notes);

        const result = validate("handoff.v1.json", handoff);
        if (!result.valid) {
          return errorResult(`Updated handoff fails schema:\n${formatErrors(result.errors)}`);
        }
        writeJson(path, handoff);
        log.info("handoff consumed", { project, id, consumedBy });
        return {
          content: [
            {
              type: "text" as const,
              text: `Consumed handoff '${id}' (by ${consumedBy}). status=CONSUMED, consumed=${handoff.consumed}.`,
            },
          ],
        };
      },
    },

    {
      tool: {
        name: "handoff_list_blueprints",
        description:
          "Convenience for aggregators (solution-architect, solution-estimate): returns paths to every agent's blueprint.md (or .yaml) in a project. Reads agents/{a}/templates and projects/{p}/{a}/ trees per docScope rules.",
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
        const projDir = projectRoot(project);
        if (!isDir(projDir)) {
          return errorResult(`Project not found: ${project}`);
        }
        const results: string[] = [];
        for (const agentEntry of readdirSync(projDir)) {
          if (agentEntry.startsWith("_")) continue; // skip _handoffs, _brownfield, _aggregator
          // Domain-scoped: blueprint.md at projects/{p}/{agent}/blueprint.md
          const domainBlueprint = join(projDir, agentEntry, "blueprint.md");
          if (isFile(domainBlueprint)) {
            results.push(`${agentEntry} (domain): ${domainBlueprint}`);
            continue;
          }
          // Feature-scoped: projects/{p}/{agent}/features/*/blueprint.md
          const featuresDir = join(projDir, agentEntry, "features");
          if (isDir(featuresDir)) {
            for (const feat of readdirSync(featuresDir)) {
              const featBlueprint = join(featuresDir, feat, "blueprint.md");
              if (isFile(featBlueprint)) {
                results.push(`${agentEntry}/${feat} (feature): ${featBlueprint}`);
              }
            }
          }
        }
        return {
          content: [
            {
              type: "text" as const,
              text:
                results.length === 0
                  ? `No blueprints found in project '${project}'.`
                  : results.join("\n"),
            },
          ],
        };
      },
    },
  ];
}

function errorResult(msg: string) {
  return {
    content: [{ type: "text" as const, text: `Error: ${msg}` }],
  };
}

// Suppress unused-import for repoPath used in future refactors
export const _internal = { repoPath };
