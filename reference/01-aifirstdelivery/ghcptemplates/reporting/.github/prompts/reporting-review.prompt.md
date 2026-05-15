---
mode: agent
description: "Review a Reporting spec for completeness and constitution compliance. Triggers on: 'review', 'spec review'."
---

Review a Reporting functional specification for completeness, constitution compliance, and implementation readiness.

## Usage

```
/reporting-review {feature-name}
```

## Steps

1. Read all files in `constitution/`.
2. Read `specs/{feature-name}/spec.md`. If the file does not exist, stop: "No spec found. Run /reporting-spec first."
3. Run all checks below.
4. Write `specs/{feature-name}/review.md` with the full review output.
5. Print a summary: overall status, BLOCKER count, REQUIRED count, ADVISORY count.

---

## Review Checks

### Category 0 — Multi-Domain Detection (run first)

Scan every FR for signals from other domains. If any are found, stop and report before all other checks.

**CE signals:** "form", "view", "plugin", "business rule on entity", "security role in D365", "PCF", "D365 UI", "D365 CE", "canvas app", "model-driven", "Power Automate flow"

**Integration signals:** "Azure Function", "Service Bus", "APIM", "Logic App", "event-driven", "inbound webhook", "outbound notification", "payload", "retry", "dead-letter", "Bicep", "infrastructure", "sync from external"

**Data Migration signals:** "ADF", "Azure Data Factory", "SFTP", "staging table", "bulk upsert via ADF", "file-based", "CSV file", "nightly load", "ingest pipeline", "data flow"

If any CE, Integration, or Data Migration signals are detected:

```
BLOCKER — MULTI-DOMAIN SPEC DETECTED
This spec contains [CE / Integration / Data Migration] requirements alongside Reporting requirements.
Run /reporting-split-spec {feature-name} to produce domain-scoped specs before proceeding.
Detected signals: {list the specific phrases found}
```

Do not proceed with other checks until the spec is split.

---

### Category 1 — Completeness

| Check | Severity |
|---|---|
| Every FR has Report Type, Target Audience, and Data Sources populated | BLOCKER |
| Section 3 (Report Catalogue) lists every report referenced in Section 5 FRs | BLOCKER |
| Section 8 (Data Model Requirements) documents at least one table per dataset | BLOCKER |
| Every FR with D365 entity data has RLS Requirements populated (not blank, not "TBD") | BLOCKER |
| Section 7 (Business Rules) contains every BR-NNN referenced in Section 5 | BLOCKER |
| Every FR has at least one Acceptance Criterion in Section 12 | BLOCKER |
| Every FR's Key Measures and KPIs uses the 6-column table format: KPI \| Logic \| Table Name \| Field Names / Filters Applied \| Display Format \| Remarks | BLOCKER |
| Every RLS role in §5 has a named test user assigned | BLOCKER |
| Section 6 (Report Impact Summary) includes Sensitivity Label column; any report sourcing D365 entity data is Confidential minimum | BLOCKER |
| Section 8a (Data Transformation and Staging) present and documents dataflow dependencies and incremental refresh strategy | Required |
| Section 9 (Assumptions and Constraints) documents credential storage approach for each data source | Required |
| Section 10 (Open Questions) is present (even if "None identified.") | Required |
| Section 15 (Brownfield Context) is populated when `brownfield.enabled: true` | Required (brownfield only) |
| Every EXTEND row in §15 states the specific delta (new column, updated filter, etc.) in Remarks | Required (brownfield only) |
| Every NEW row in §15 confirms absence from `functional/entity-catalogue.md` | Required (brownfield only) |
| Every FR that contains a KPI mapping to an existing entity/table has a corresponding §15 row | Required (brownfield only) |

### Category 2 — Constitution Compliance

| Check | Severity |
|---|---|
| Any report surfacing D365 entity data without RLS | BLOCKER (⚠ RLS MISSING) |
| Any FR proposing a flat denormalised table as the sole dataset | BLOCKER |
| Report type mismatch: interactive report used for pixel-perfect document | BLOCKER |
| Measure defined inline in a visual rather than as a named measure | BLOCKER |
| Data source credentials mentioned as hardcoded in PBIX | BLOCKER |
| No Date dimension table in the dataset | BLOCKER |
| Bidirectional relationship proposed without justification | BLOCKER |
| Sensitivity label not assigned for any report (Public/Internal/Confidential/Highly Confidential) | BLOCKER |
| Embedding scenario specified without service principal authentication | BLOCKER |
| Uncertified custom visuals from AppSource proposed | Required |
| Canvas size deviates from constitution default (1280×720 or 1280×960) without justification | Required |
| Accessibility requirements missing for any interactive or embedded report | Required |
| Incremental refresh not addressed for datasets with fact tables expected > 10M rows | Required |
| DAX expressions included in the spec (spec must be functional-only) | Advisory |
| Role-playing dimension identified but USERELATIONSHIP() not noted as TDD requirement | Advisory |

### Category 3 — Implementation Readiness

| Check | Severity |
|---|---|
| All data sources are named and accessible (not "TBD") | BLOCKER |
| RLS user groups / test users are identified for each role | BLOCKER |
| Refresh schedule conflicts with dataset dependencies (e.g., dataflow not yet complete) | Required |
| Report type requires Power BI Premium but capacity is not confirmed | Required |
| Dataflow dependencies and refresh sequencing documented in §8a | Required |
| Scalability: 3-year row growth estimate provided for each fact table | Required |
| SSRS report uses SQL data source but stored procedure not yet designed | Advisory |
| Subscription recipients/trigger conditions not fully specified | Advisory |

### Category 4 — Traceability

| Check | Severity |
|---|---|
| Every FR in Section 5 appears in Section 14 (Traceability Matrix) | Required |
| Every report in Section 3 (Catalogue) has at least one FR in Section 5 | Required |
| Every BR in Section 7 is referenced by at least one FR | Advisory |

---

### Category 5 — Cross-Feature Overlaps (informational; does not block approval)

- Read `plans/_component-registry.md` if it exists
- Scan all Reporting components listed in §6 Report Impact Summary against the registry (Power BI datasets, Power BI reports, SSRS reports, DAX measures, RLS roles, Dataflows, Power BI workspaces)
- For each match: log as INFORMATIONAL — record the owning feature, component name, and whether the actions are compatible
- If a CONFLICT is detected (two features claiming incompatible modifications to the same component): raise as Advisory — "Component {name} is also claimed by feature {other-feature} with action {action}. Resolve the overlap before /reporting-plan to avoid deployment conflicts."
- If no `_component-registry.md` exists or no matches found: note "No cross-feature overlaps detected at spec stage."
- Record findings under a **Cross-Feature Overlaps** section in the review report

---

## Review Output (`specs/{feature-name}/review.md`)

```markdown
---
feature: {feature-name}
review-date: {YYYY-MM-DD}
reviewer: Claude Code (/reporting-review)
status: APPROVED | REQUIRES CHANGES
blockers: {N}
required: {N}
advisory: {N}
---

# Review — {feature-name}

## Status: {APPROVED | REQUIRES CHANGES}

## BLOCKERs ({N})
{List each BLOCKER with FR reference and description. "None." if zero.}

## REQUIRED Changes ({N})
{List each REQUIRED change with FR reference and description. "None." if zero.}

## ADVISORY Notes ({N})
{List each advisory. "None." if zero.}

## Passed Checks
{Bullet list of checks that passed cleanly.}

## Next Step
{If APPROVED: "Run /reporting-fdd {feature-name} or /reporting-plan {feature-name}"}
{If REQUIRES CHANGES: "Resolve all BLOCKERs and REQUIRED items, then re-run /reporting-review {feature-name}"}
```

## Rules

- Status is `APPROVED` only when BLOCKER count = 0. REQUIRED items do not block approval but must be tracked and resolved before `/reporting-plan`.
- Never approve a spec with an unresolved ⚠ RLS MISSING flag.
- Never approve a spec where multi-domain signals were detected — it must be split first.
- Never approve a spec with a flat denormalised table as the sole dataset, measures defined inline, or hardcoded credentials.
- Never approve a spec with a missing Date dimension table in any dataset.
- Never approve a spec where a sensitivity label is absent from §6.
- **AI Notes:** In the generated review report, at the end of each finding entry (each BLOCKER, REQUIRED, and RECOMMENDED item), append `> **AI Notes** — {1–2 sentences: reasoning behind the severity classification, the specific rule applied, or the risk if left unresolved}`. Write only what is non-obvious — do not repeat the finding description.