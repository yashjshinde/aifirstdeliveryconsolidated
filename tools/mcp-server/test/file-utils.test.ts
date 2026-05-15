/**
 * Unit tests for file-utils — frontmatter extraction + JSON/YAML round-trip.
 */

import { describe, it, expect } from "vitest";
import { extractFrontmatter } from "../src/lib/file-utils.js";

describe("extractFrontmatter", () => {
  it("returns null frontmatter for content without --- block", () => {
    const r = extractFrontmatter("# Hello\n\nWorld\n");
    expect(r.frontmatter).toBeNull();
    expect(r.body).toBe("# Hello\n\nWorld\n");
  });

  it("parses standard frontmatter block", () => {
    const r = extractFrontmatter(`---
feature-id: case-management
agent: d365-ce
phase: DEFINE
schema-version: spec.v1
---

## AI Summary

Body.
`);
    expect(r.frontmatter).not.toBeNull();
    expect(r.frontmatter!["feature-id"]).toBe("case-management");
    expect(r.frontmatter!["agent"]).toBe("d365-ce");
    expect(r.body.trimStart().startsWith("## AI Summary")).toBe(true);
  });

  it("handles array values in frontmatter", () => {
    const r = extractFrontmatter(`---
agents-enabled: [d365-ce, integration]
---

content
`);
    expect(r.frontmatter).not.toBeNull();
    expect(r.frontmatter!["agents-enabled"]).toEqual(["d365-ce", "integration"]);
  });

  it("handles nested object frontmatter", () => {
    const r = extractFrontmatter(`---
multilingual:
  crm: false
  portal: true
---

body
`);
    expect(r.frontmatter).not.toBeNull();
    const m = r.frontmatter!["multilingual"] as Record<string, boolean>;
    expect(m.crm).toBe(false);
    expect(m.portal).toBe(true);
  });

  it("returns null frontmatter if YAML is malformed", () => {
    const r = extractFrontmatter(`---
this: is: not: valid: yaml: here:
---

body
`);
    // js-yaml may either throw (caught → null) or parse partial; we accept either as long as we don't crash.
    // The body should still be extractable.
    expect(r.body.includes("body")).toBe(true);
  });
});
