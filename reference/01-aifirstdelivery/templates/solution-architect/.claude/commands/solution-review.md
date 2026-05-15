Validate an existing solution blueprint against the constitution and flag gaps before it is used
for design reviews or stakeholder sign-off.

## Usage

```
/solution-review {project-name}
```

---

## Step 1 — Load Constitution

Read every file in `constitution/` before proceeding.

---

## Step 2 — Read the Blueprint

Read `output/{project-name}/solution-blueprint.md`.

If the file does not exist, stop:

```
ERROR: output/{project-name}/solution-blueprint.md not found.
Run /solution-blueprint {project-name} first.
```

---

## Step 3 — Validate Against Constitution Checklist

Check every item below. Record PASS, FAIL, or WARNING for each.

### Completeness

- [ ] All 10 sections present (Executive Summary through Traceability)
- [ ] Section 0 (Input Sources) documents which templates and features were read
- [ ] Section 2.3 (Feature Map) lists every feature
- [ ] Section 3.3 (Feature Dependency Diagram) is present and shows cross-template links
- [ ] Section 4.0 (Platform Coverage) covers all three platforms if applicable
- [ ] Section 10 Traceability includes an entry for every FR from every input spec

### Diagrams (constitution/03-diagram-standards.md)

- [ ] 3.2 Logical Architecture — `flowchart TB` present
- [ ] 3.3 Feature Dependency — `flowchart LR` present
- [ ] 4.2 Data Architecture — `erDiagram` present
- [ ] 4.3 Automation Architecture — `flowchart TD` present
- [ ] 4.4 Security Architecture — `flowchart LR` present
- [ ] 5.1 Integration Overview — `flowchart LR` present
- [ ] 5.2 Primary Integration sequence — `sequenceDiagram` present
- [ ] 6.1 Environment & Deployment — `flowchart LR` present
- [ ] 7 Observability — `flowchart LR` present

### Architecture Principles (constitution/01-architecture-principles.md)

- [ ] No code, formula snippets, or task-level steps present
- [ ] Every cross-template dependency identified appears in at least one diagram
- [ ] Shared Dataverse tables not duplicated across sections
- [ ] Naming consistent with publisher prefix and Azure resource prefix from sibling constitutions

### Cross-Platform Patterns (constitution/02-cross-platform-patterns.md)

- [ ] D365 CE → Azure integration shown via Service Bus (not direct HTTP from plugin)
- [ ] Power Apps → Azure shown via APIM (not direct Service Bus binding)
- [ ] Azure Function → Dataverse uses Managed Identity (not hardcoded credentials)
- [ ] No hardcoded connection strings, GUIDs, or environment URLs in blueprint prose
- [ ] Cross-template naming conflicts flagged as risks in Section 8 if present

### D365 F&O Patterns (if d365-fo features present)

- [ ] D365 F&O → Azure integration shown via outbound INT interface class (not direct HTTP from X++ sync path)
- [ ] Azure → D365 F&O inbound shown via Data Entity (OData / DMF) — not direct table insert
- [ ] D365 F&O and D365 CE are separate platforms — master data sync (customers, products) goes through Integration layer, not direct connection
- [ ] D365 F&O business events used where event-driven pattern is appropriate
- [ ] D365 F&O environments (DEV/TEST/UAT/PROD) mapped to deployment pipeline in Section 6

### Brownfield Baseline (if `brownfield.enabled: true` in `constitution/10-project-configuration.md`)

Read `constitution/10-project-configuration.md` to determine if brownfield mode is active. If not active, skip this section entirely.

- [ ] Section 0 contains a **Brownfield Baseline Sources** subsection listing each brownfield doc and its status
- [ ] Section 3.2 Logical Architecture diagram uses grey styling (`fill:#ccc`) to distinguish existing components from new ones, with a legend
- [ ] Section 4.2 Data Architecture marks existing entities as `[EXISTING]` and describes only the delta, not the full existing schema
- [ ] Section 8 Risks includes at least one **Backward Compatibility Risk** entry (R-BF-xxx) covering the existing system impact
- [ ] Section 5 Integration Architecture does not re-document existing integration endpoints in full — references "existing — see brownfield baseline"

---

## Step 4 — Write Review Report

Write to `output/{project-name}/solution-review.md`:

```markdown
---
project: {project-name}
reviewed-date: {YYYY-MM-DD}
status: APPROVED | NEEDS REWORK
author: Claude Code (/solution-review)
---

# Solution Blueprint Review — {project-name}

## Status: APPROVED / NEEDS REWORK

## Blockers *(must fix before design review)*

| ID | Section | Issue |
|---|---|---|

## Required *(fix before stakeholder sign-off)*

| ID | Section | Issue |
|---|---|---|

## Recommended *(best practice gaps)*

| ID | Section | Gap |
|---|---|---|

## Checklist Summary

| Area | Items | Pass | Fail | Warning |
|---|---|---|---|---|
| Completeness | {n} | {n} | {n} | {n} |
| Diagrams | {n} | {n} | {n} | {n} |
| Architecture Principles | {n} | {n} | {n} | {n} |
| Cross-Platform Patterns | {n} | {n} | {n} | {n} |
| Brownfield Baseline | {n / N/A} | {n} | {n} | {n} |
```

---

## Step 5 — Print Summary

```
REVIEW COMPLETE — {project-name}
═════════════════════════════════
Status    : APPROVED / NEEDS REWORK
Blockers  : {N}
Required  : {N}
Warnings  : {N}
Output    : output/{project-name}/solution-review.md
```
