/**
 * Unit tests for doc-lint validators.
 * Run with: npm test
 */

import { describe, it, expect } from "vitest";
import { lintDocument, summarize } from "../src/groups/doc-lint/validators.js";

describe("doc-lint validators", () => {
  it("passes a well-formed spec document", () => {
    const doc = `---
feature-id: case-management
agent: d365-ce
phase: DEFINE
schema-version: spec.v1
---

## AI Summary

This spec covers case management.

## 1. Business context

Some context here.

## 2. Functional requirements

### FR-01 Auto-assign cases
...

## Traceability matrix

| FR | NFR |
|---|---|
| FR-01 | NFR-01 |
`;
    const findings = lintDocument(doc);
    const s = summarize(findings);
    expect(s.bySeverity.BLOCKER).toBe(0);
  });

  it("flags missing frontmatter as BLOCKER", () => {
    const doc = `## AI Summary\n\nNo frontmatter here.`;
    const findings = lintDocument(doc);
    expect(findings.some((f) => f.rule === "frontmatter-required" && f.severity === "BLOCKER")).toBe(true);
  });

  it("flags missing AI Summary as BLOCKER", () => {
    const doc = `---
feature-id: x
agent: d365-ce
phase: DEFINE
schema-version: spec.v1
---

## Some other section
`;
    const findings = lintDocument(doc);
    expect(findings.some((f) => f.rule === "ai-summary-required")).toBe(true);
  });

  it("flags PNG image references as BLOCKER (Mermaid-only rule)", () => {
    const doc = `---
feature-id: x
agent: d365-ce
phase: DEFINE
schema-version: spec.v1
---

## AI Summary

Test.

![diagram](./diagrams/architecture.png)

## Traceability matrix
| FR | NFR |
|---|---|
| FR-01 | - |
`;
    const findings = lintDocument(doc);
    expect(findings.some((f) => f.rule === "mermaid-only")).toBe(true);
  });

  it("flags HTML img tag as BLOCKER", () => {
    const doc = `---
feature-id: x
agent: d365-ce
phase: DEFINE
schema-version: spec.v1
---

## AI Summary

Test.

<img src="x.png" />
`;
    const findings = lintDocument(doc);
    expect(findings.some((f) => f.rule === "mermaid-only")).toBe(true);
  });

  it("flags missing Quality self-check on FDD as BLOCKER", () => {
    const doc = `---
feature-id: x
agent: d365-ce
phase: DESIGN
schema-version: fdd.v1
---

## AI Summary

Test.

## 1. Introduction

Body.
`;
    const findings = lintDocument(doc);
    expect(findings.some((f) => f.rule === "quality-self-check")).toBe(true);
  });

  it("passes FDD with Quality self-check appendix", () => {
    const doc = `---
feature-id: x
agent: d365-ce
phase: DESIGN
schema-version: fdd.v1
---

## AI Summary

Test.

## 1. Introduction
## 2. Process
## 3. Scenarios

## Quality self-check

(populated by /fdd)
`;
    const findings = lintDocument(doc);
    expect(findings.some((f) => f.rule === "quality-self-check")).toBe(false);
  });

  it("requires TOC when doc has >= 3 sections", () => {
    const doc = `---
feature-id: x
agent: d365-ce
phase: DEFINE
schema-version: spec.v1
---

## AI Summary

Test.

## 1. Section one

## 2. Section two

## 3. Section three
`;
    const findings = lintDocument(doc);
    expect(findings.some((f) => f.rule === "toc-required")).toBe(true);
  });

  it("does not require TOC when fewer than 3 sections", () => {
    const doc = `---
feature-id: x
agent: d365-ce
phase: DEFINE
schema-version: spec.v1
---

## AI Summary

Just the AI summary.

## Traceability

| FR | NFR |
|---|---|
| FR-01 | - |
`;
    const findings = lintDocument(doc);
    expect(findings.some((f) => f.rule === "toc-required")).toBe(false);
  });

  it("flags ADO inline ID as BLOCKER", () => {
    const doc = `---
feature-id: x
agent: d365-ce
phase: DEFINE
schema-version: spec.v1
---

## AI Summary

See AB#1234 for context.

## Traceability matrix
| FR | NFR |
|---|---|
| FR-01 | - |
`;
    const findings = lintDocument(doc);
    expect(findings.some((f) => f.rule === "no-inline-alm-ids")).toBe(true);
  });

  it("flags missing feature-id marker in domain doc as BLOCKER", () => {
    const doc = `---
feature-id: x
agent: d365-ce
phase: DESIGN
schema-version: fdd.v1
doc-scope: domain
---

## AI Summary

Test.

## 1. Some section

Body without the feature-id comment marker.

## Quality self-check
`;
    const findings = lintDocument(doc);
    expect(findings.some((f) => f.rule === "feature-id-markers")).toBe(true);
  });
});
