/**
 * config-resolve tool group — two-layer override resolution per ADR-0010.
 *
 * Pattern:
 *   1. projects/{p}/{agent}/{feature-folder}/{templates-override|constitution-override}/{file}
 *   2. agents/{agent}/{templates|constitution}/{file}
 *
 * First match wins. No merging.
 *
 * Tools:
 *   - config_resolve            — return effective path for a constitution/template file
 *   - config_resolve_template   — convenience for the templates/{type}.template.md lookup
 *   - config_resolve_full       — diagnostic: return both layers + which one wins
 */

import type { RegisteredTool } from "../../index.js";
import { agentRoot, projectFeatureRoot, isFile, repoPath } from "../../lib/repo-paths.js";
import { readText, extractFrontmatter } from "../../lib/file-utils.js";
import { join } from "node:path";

type ResolveKind = "constitution" | "template";

function resolvePath(
  kind: ResolveKind,
  project: string | undefined,
  agent: string,
  feature: string | undefined,
  fileName: string
): { effectivePath: string; layer: "project-override" | "agent-default" | "missing"; agentDefault: string; projectOverride: string | null } {
  // Compute the agent-default path
  const agentSub = kind === "constitution" ? "constitution" : "templates";
  const agentDefault = join(agentRoot(agent), agentSub, fileName);

  // Project override exists only when --project AND --feature are both provided
  // and the override folder exists under the per-feature directory.
  let projectOverride: string | null = null;
  if (project && feature) {
    const overrideSub = kind === "constitution" ? "constitution-override" : "templates-override";
    projectOverride = join(projectFeatureRoot(project, agent, feature), overrideSub, fileName);
  }

  if (projectOverride && isFile(projectOverride)) {
    return { effectivePath: projectOverride, layer: "project-override", agentDefault, projectOverride };
  }
  if (isFile(agentDefault)) {
    return { effectivePath: agentDefault, layer: "agent-default", agentDefault, projectOverride };
  }
  return { effectivePath: "", layer: "missing", agentDefault, projectOverride };
}

/**
 * For templates: check if the project override frontmatter's `based-on-template-version`
 * matches the agent default's `template-version` frontmatter.
 * Returns null if no drift, or a warning message if drift detected.
 */
function checkTemplateDrift(agentDefault: string, projectOverride: string): string | null {
  try {
    const agentFm = extractFrontmatter(readText(agentDefault)).frontmatter ?? {};
    const overrideFm = extractFrontmatter(readText(projectOverride)).frontmatter ?? {};
    const agentVersion = agentFm["template-version"];
    const basedOn = overrideFm["based-on-template-version"];
    if (agentVersion && basedOn && agentVersion !== basedOn) {
      return `Override at ${projectOverride} is based-on ${basedOn} but the agent template is now ${agentVersion}. Consider re-syncing.`;
    }
    return null;
  } catch {
    return null;
  }
}

export function registerConfigResolve(): RegisteredTool[] {
  return [
    {
      tool: {
        name: "config_resolve",
        description:
          "Two-layer override resolution per ADR-0010 — returns the effective file path for a constitution or template file. Layer 1: per-feature project override (if project+feature passed). Layer 2: agent default. First match wins; no merging.",
        inputSchema: {
          type: "object",
          properties: {
            kind: { enum: ["constitution", "template"] },
            agent: { type: "string", description: "Agent slug (e.g., 'd365-ce')" },
            file: {
              type: "string",
              description: "File name within the constitution/ or templates/ folder (e.g., '02-nfr.md', 'fdd.template.md').",
            },
            project: {
              type: "string",
              description: "Optional project slug for project-level override lookup.",
            },
            feature: {
              type: "string",
              description: "Optional feature slug (required with project).",
            },
          },
          required: ["kind", "agent", "file"],
        },
      },
      handler: async (args) => {
        const kind = args.kind as ResolveKind;
        const agent = String(args.agent);
        const file = String(args.file);
        const project = args.project as string | undefined;
        const feature = args.feature as string | undefined;

        if (project && !feature) {
          return errorResult("when 'project' is provided, 'feature' is also required (overrides are per-feature).");
        }

        const result = resolvePath(kind, project, agent, feature, file);
        if (result.layer === "missing") {
          return errorResult(
            `No ${kind} file found for agent '${agent}' file '${file}'.\n` +
              `Looked at:\n  agent default: ${result.agentDefault}\n` +
              (result.projectOverride ? `  project override: ${result.projectOverride}\n` : "")
          );
        }

        const lines = [
          `Resolved: ${result.effectivePath}`,
          `Layer: ${result.layer}`,
        ];

        // Drift check for template kind with project override
        if (kind === "template" && result.layer === "project-override" && result.projectOverride) {
          const drift = checkTemplateDrift(result.agentDefault, result.projectOverride);
          if (drift) {
            lines.push(`Warning: ${drift}`);
          }
        }

        return {
          content: [{ type: "text" as const, text: lines.join("\n") }],
        };
      },
    },

    {
      tool: {
        name: "config_resolve_template",
        description:
          "Convenience wrapper for resolving a template by type (e.g., 'fdd', 'tdd', 'spec', 'plan', 'blueprint', 'test-plan/index', 'review-report'). Equivalent to config_resolve with kind=template and file={type}.template.md.",
        inputSchema: {
          type: "object",
          properties: {
            type: { type: "string", description: "Template type (e.g., 'fdd', 'tdd', 'spec')." },
            agent: { type: "string" },
            project: { type: "string" },
            feature: { type: "string" },
          },
          required: ["type", "agent"],
        },
      },
      handler: async (args) => {
        const type = String(args.type);
        const agent = String(args.agent);
        const project = args.project as string | undefined;
        const feature = args.feature as string | undefined;
        const file = type.endsWith(".template.md") ? type : `${type}.template.md`;

        const result = resolvePath("template", project, agent, feature, file);
        if (result.layer === "missing") {
          return errorResult(
            `No template '${file}' found for agent '${agent}'.\n` +
              `Agent default expected at: ${result.agentDefault}`
          );
        }
        const lines = [`Resolved: ${result.effectivePath}`, `Layer: ${result.layer}`];
        if (result.layer === "project-override" && result.projectOverride) {
          const drift = checkTemplateDrift(result.agentDefault, result.projectOverride);
          if (drift) lines.push(`Warning: ${drift}`);
        }
        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      },
    },

    {
      tool: {
        name: "config_resolve_full",
        description:
          "Diagnostic — returns BOTH layers (project override and agent default) plus which one would win and any drift warning. Useful for /customize-template diff workflows.",
        inputSchema: {
          type: "object",
          properties: {
            kind: { enum: ["constitution", "template"] },
            agent: { type: "string" },
            file: { type: "string" },
            project: { type: "string" },
            feature: { type: "string" },
          },
          required: ["kind", "agent", "file", "project", "feature"],
        },
      },
      handler: async (args) => {
        const kind = args.kind as ResolveKind;
        const agent = String(args.agent);
        const file = String(args.file);
        const project = String(args.project);
        const feature = String(args.feature);

        const result = resolvePath(kind, project, agent, feature, file);
        const overrideExists = result.projectOverride ? isFile(result.projectOverride) : false;
        const defaultExists = isFile(result.agentDefault);

        const lines = [
          `Project override: ${result.projectOverride ?? "(none expected)"} — exists=${overrideExists}`,
          `Agent default:    ${result.agentDefault} — exists=${defaultExists}`,
          `Effective layer:  ${result.layer}`,
          `Effective path:   ${result.effectivePath || "(none)"}`,
        ];
        if (kind === "template" && overrideExists && defaultExists && result.projectOverride) {
          const drift = checkTemplateDrift(result.agentDefault, result.projectOverride);
          if (drift) lines.push(`Drift warning:    ${drift}`);
        }
        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      },
    },
  ];
}

function errorResult(msg: string) {
  return {
    content: [{ type: "text" as const, text: `Error: ${msg}` }],
  };
}

// Suppress unused-import warning for repoPath (may be used in future refactors)
export const _internal = { repoPath };
