---
feature: {feature-name}
task-id: {L4-Prefix}-{NNN}
title: {Task Title}
component-type: Dataset | DataModel | Measure | RLS | Report-Interactive | Report-Paginated | Report-SSRS | Dataflow | Configuration | Deployment | Testing
story-ref: {L3-Prefix}-{NNN}
fr-refs: FR-001, FR-002
role: BI Developer | Data Engineer | QA | Functional
type: DataModel | MeasureDev | RLSConfig | ReportBuild | SSRSDev | Dataflow | Config | Testing | Deployment
complexity: S | M | L | XL
status: TODO | IN PROGRESS | DONE
validation-status: NOT VALIDATED | READY TO IMPLEMENT | NEEDS REWORK | BLOCKED
output-path: output/{feature-name}/
impl-doc-path: — (set by /implement)
alm-type: {L4-Type}
alm-parent-ref: {L3-Prefix}-{NNN}
alm-id: null
priority: High | Medium | Low
author: Claude Code (/task)
---

# {L4-Type} {L4-Prefix}-{NNN} — {Task Title}

## Table of Contents

- [Plan Reference](#plan-reference)
- [Document Control](#document-control)
- [Context](#context)
- [Pre-requisites](#pre-requisites)
- [Reporting Specifics](#reporting-specifics)
- [Technical Approach](#technical-approach)
- [Validation](#validation)
- [Acceptance Criteria](#acceptance-criteria)
- [Test Cases](#test-cases)
- [Output Location](#output-location)
- [Definition of Done](#definition-of-done)

---

## Plan Reference

| Field | Value |
|---|---|
| **{L3-Type}** | {L3-Prefix}-{NNN} — {Story title} |
| **{L2-Type}** | {L2-Prefix}-{NNN} — {Functional grouping title} |
| **{L1-Type}** | {L1-Prefix}-{NNN} — {Reporting capability title} |
| **Functional Requirements** | FR-001, FR-002 |
| **Related Tasks** | {L4-Prefix}-NNN *(depends on)*, {L4-Prefix}-NNN *(follow-on)* |

---

## Document Control

| Field | Value |
|---|---|
| Task ID | {L4-Prefix}-{NNN} |
| Feature | {feature-name} |
| Author | Claude Code (/task) |
| Created | {YYYY-MM-DD} |
| Status | {TODO \| IN PROGRESS \| DONE} |
| Validation | {NOT VALIDATED \| READY TO IMPLEMENT \| NEEDS REWORK \| BLOCKED} |

---

## Context

{Why this task exists. What business reporting problem it solves. Reference the user story and functional requirements.}

**Story ACs covered:** This task contributes to acceptance criteria AC-001, AC-002 of {L3-Prefix}-{NNN}.

---

## Pre-requisites

- [ ] {Dependency task — e.g., "{L4-Prefix}-NNN (dataset fact table) must be DONE"}
- [ ] {Environment state — e.g., "Power BI workspace `{WorkspaceName}-DEV` exists and developer has Contributor access"}
- [ ] {Access or tooling — e.g., "Gateway configured for {DataSourceName} in DEV environment"}

---

## Reporting Specifics

<!-- GENERATOR: Populate only the rows relevant to this component type. Remove rows that don't apply. -->

| Field | Value |
|---|---|
| **PBIX / RDL File** | `{filename.pbix}` or `{filename.rdl}` |
| **Dataset / Data Source** | `{DatasetName}` — {data source connection string or gateway} |
| **Workspace** | `{WorkspaceName}-DEV` / `-UAT` / `-PROD` |
| **Report Page / Tab** | `{PageName}` *(Report-Interactive / Report-Paginated tasks only)* |
| **Measure Name** | `{MeasureName}` *(Measure tasks only)* |
| **RLS Role Name** | `{RoleName}` — filter: `{DAX filter logic in plain language}` *(RLS tasks only)* |
| **Stored Procedure** | `{schema.proc_name}` with params: `{@param1}`, `{@param2}` *(SSRS tasks only)* |
| **Existing Fields** | *(Brownfield EXTEND tasks only)* {comma-separated list of columns/measures already in dataset — from brownfield docs. Write "N/A — NEW component" for NEW tasks.} |
| **Net-New Fields** | *(Brownfield EXTEND tasks only)* {comma-separated list of columns/measures being added by this task} |

---

## Technical Approach

Step-by-step implementation guide. Written for a BI developer who has not seen the spec or plan.

1. {Step 1 — specific action, e.g., "Open Power BI Desktop and connect to `{DataSourceName}` via the gateway"}
2. {Step 2 — e.g., "Add `{TableName}` table with the following columns: ..."}
3. {Step 3 — e.g., "Create measure `{MeasureName}` with logic: {business definition}"}
4. {Step 4 — e.g., "Publish to `{WorkspaceName}-DEV` workspace"}

---

## Validation

Quick verification steps to confirm this task is complete and working.

- {Verification step 1 — what to do and expected result; e.g., "Open report in DEV workspace — page loads in < 3 seconds"}
- {Verification step 2 — e.g., "Apply RLS test user `{TestUser}` — only records matching `{FilterCondition}` visible"}
- {Verification step 3 — e.g., "Export to PDF — all pages render without truncation"}

---

## Acceptance Criteria

| AC-ID | Criterion | Verification Method |
|---|---|---|
| AC-001 | {Testable statement — e.g., "Report page `{PageName}` loads within 3 seconds with 100K row dataset"} | Manual test in DEV workspace |
| AC-002 | {Testable statement — e.g., "RLS role `{RoleName}` filters data so user sees only their own records"} | RLS test with named test user |

---

## Test Cases

<!-- GENERATOR: Test Cases section for BI developer/QA to fill out after implementation. -->

| TC-ID | AC-Ref | Description | Pre-conditions | Steps | Expected Result |
|---|---|---|---|---|---|
| TC-001 | AC-001 | {Test description — e.g., "Verify report load time"} | {Setup — e.g., "Dataset refreshed; 100K rows in fact table"} | {Steps} | {Expected — e.g., "Page loads in < 3 sec"} |
| TC-002 | AC-001 | {Negative test — e.g., "Verify behaviour with empty dataset"} | {Setup} | {Steps} | {Expected error or empty-state visual} |

---

## Output Location

All generated files for this task:

```
output/{feature-name}/
  └─ {filename.pbix} / {filename.rdl}
output/{feature-name}/measures/
  └─ {MeasureName}.dax        (measure definition for source control)
output/{feature-name}/rls/
  └─ {RoleName}-rls.md        (RLS filter logic and test evidence)
```

> **AI Notes** — {1–2 sentences: key design decision, RLS boundary risk, or performance trade-off specific to this task.}

---

## Definition of Done

- [ ] Component built and saved to correct `output/` path
- [ ] All acceptance criteria verified in DEV workspace
- [ ] Validation steps executed — results match expected
- [ ] Data accuracy test executed (tolerance ≤ ±0.01% against source)
- [ ] RLS validation completed for all roles (if applicable)
- [ ] Report load time within target (< 3 sec interactive / < 10 sec paginated)
- [ ] No constitution rule violated
- [ ] Sensitivity label applied: {label}
- [ ] Task card updated: status = DONE
