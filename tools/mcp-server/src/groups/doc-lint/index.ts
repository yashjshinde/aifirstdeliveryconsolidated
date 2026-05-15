/**
 * doc-lint tool group — universal doc rule enforcement.
 *
 * Tools:
 *   - doc_lint            — validate one file; returns findings
 *   - doc_lint_batch      — validate every .md file in a folder (recursive)
 */

import type { RegisteredTool } from "../../index.js";
import { readText, walkFiles } from "../../lib/file-utils.js";
import { lintDocument, summarize, type Finding } from "./validators.js";
import { existsSync } from "node:fs";

export function registerDocLint(): RegisteredTool[] {
  return [
    {
      tool: {
        name: "doc_lint",
        description:
          "Validate one markdown file against the universal doc rules (frontmatter, TOC, Mermaid-only, AI Summary, traceability, no inline ALM IDs, quality self-check appendix, feature-id markers for domain docs). Returns pass/fail + findings list.",
        inputSchema: {
          type: "object",
          properties: {
            file: {
              type: "string",
              description: "Absolute path or path relative to the repo root.",
            },
            skipRules: {
              type: "array",
              description: "Optional list of rule names to skip (e.g., when --waive-coverage was applied).",
              items: { type: "string" },
            },
            requiredFrontmatterKeys: {
              type: "array",
              description: "Override the default required frontmatter keys (for ADRs / design docs).",
              items: { type: "string" },
            },
          },
          required: ["file"],
        },
      },
      handler: async (args) => {
        const file = String(args.file ?? "");
        const skipRules = (args.skipRules as string[] | undefined) ?? [];
        const requiredFrontmatterKeys = args.requiredFrontmatterKeys as string[] | undefined;
        if (!file) {
          return errorResult("missing required argument: file");
        }
        if (!existsSync(file)) {
          return errorResult(`file not found: ${file}`);
        }
        const content = readText(file);
        const findings = lintDocument(content, {
          skipRules,
          requiredFrontmatterKeys,
        });
        const summary = summarize(findings);
        return {
          content: [
            {
              type: "text" as const,
              text: formatFindings(file, findings, summary),
            },
          ],
        };
      },
    },

    {
      tool: {
        name: "doc_lint_batch",
        description:
          "Recursively lint every .md file under a folder. Returns aggregate counts + per-file findings.",
        inputSchema: {
          type: "object",
          properties: {
            folder: {
              type: "string",
              description: "Folder to walk (absolute or relative to repo root).",
            },
            skipRules: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["folder"],
        },
      },
      handler: async (args) => {
        const folder = String(args.folder ?? "");
        const skipRules = (args.skipRules as string[] | undefined) ?? [];
        if (!folder) return errorResult("missing required argument: folder");
        if (!existsSync(folder)) return errorResult(`folder not found: ${folder}`);

        const files = walkFiles(folder, (p) => p.endsWith(".md"));
        let totalBlockers = 0;
        let totalRequired = 0;
        let totalWarnings = 0;
        let failedFiles = 0;
        const perFile: string[] = [];

        for (const f of files) {
          const findings = lintDocument(readText(f), { skipRules });
          const s = summarize(findings);
          totalBlockers += s.bySeverity.BLOCKER;
          totalRequired += s.bySeverity.REQUIRED;
          totalWarnings += s.bySeverity.WARNING;
          if (!s.pass) failedFiles++;
          if (findings.length > 0) {
            perFile.push(formatFindings(f, findings, s));
          }
        }

        const header = [
          `Batch lint: ${files.length} file(s) under '${folder}'.`,
          `  Failed files (BLOCKER>0): ${failedFiles}`,
          `  Totals — BLOCKER: ${totalBlockers}, REQUIRED: ${totalRequired}, WARNING: ${totalWarnings}`,
          "",
        ].join("\n");

        return {
          content: [
            {
              type: "text" as const,
              text: header + (perFile.length > 0 ? perFile.join("\n\n") : "(no findings)"),
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

function formatFindings(
  file: string,
  findings: Finding[],
  summary: ReturnType<typeof summarize>
): string {
  const lines: string[] = [];
  lines.push(`File: ${file}`);
  lines.push(
    `Result: ${summary.pass ? "PASS" : "FAIL"} — BLOCKER: ${summary.bySeverity.BLOCKER}, REQUIRED: ${summary.bySeverity.REQUIRED}, WARNING: ${summary.bySeverity.WARNING}`
  );
  if (findings.length === 0) {
    lines.push("(no findings)");
    return lines.join("\n");
  }
  lines.push("");
  for (const f of findings) {
    const loc = f.line ? ` line ${f.line}` : "";
    lines.push(`  [${f.severity}] ${f.rule}${loc}: ${f.message}`);
  }
  return lines.join("\n");
}
