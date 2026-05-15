Review a D365 F&O Functional Design Document from the perspective of a Senior D365 F&O Solution Architect. The review sets APPROVED or NEEDS REWORK status — TDD cannot be generated until the FDD is APPROVED.

## Usage

```
/fdd-review {requirement-name}
```

---

## Step 1 — Load Constitution

Read every file in `constitution/` before proceeding.

## Step 2 — Load Review Checklist

Read `Prompts/fdd-review/checklist.md`. Apply every criterion in the checklist.

## Step 3 — Read Documents

Read `docs/{requirement-name}/fdd.md`.

If the file does not exist, stop:
```
ERROR: docs/{requirement-name}/fdd.md not found.
Run /fdd {requirement-name} first.
```

## Step 4 — Conduct Review

Apply every review criterion from the checklist. For each criterion, record:
- Status: PASS / FAIL / WARNING / N/A
- Finding: specific gap, risk, or observation (not generic — point to the exact section and be precise)

### Review categories:

**0. Multi-Domain Detection (run first)**
Scan the FDD for signals of requirements that belong outside D365 F&O. If any integration or data migration signals are found, raise a BLOCKER before evaluating any other category:
- **Integration signals to detect:** "Azure Function", "Service Bus", "APIM", "Logic App", "event-driven pipeline", "sync from external system", "publish to external", "DLQ", "dead-letter", "retry policy", "idempotent upsert", "Bicep", "inbound webhook", "outbound to external API", "throughput SLA", "latency SLA", "infrastructure provisioning"
- **Data Migration signals to detect:** "ADF", "Azure Data Factory", "SFTP", "staging table", "raw table", "ingest pipeline", "ADF data flow", "bulk upsert via ADF", "file-based batch load", "CSV file", "migration schedule", "nightly load", "error table", "stage promotion"
- **BLOCKER text (Integration):** "This FDD contains Azure Integration requirements that are out of scope for the D365 F&O agent. Run `/split-spec {requirement-name}` to separate the F&O and integration portions before proceeding. The integration spec must then be handed to the Azure Integration agent."
- **BLOCKER text (Data Migration):** "This FDD contains Data Migration requirements (ADF pipelines, SFTP, staging) that are out of scope for the D365 F&O agent. Run `/split-spec {requirement-name}` to separate the F&O and data migration portions before proceeding. The data migration spec must then be handed to the Data Migration agent."
- If this BLOCKER is raised, set status to `NEEDS REWORK` and stop — do not evaluate further categories.

**1. Completeness and Coverage**
- All functional requirements from the business requirement addressed?
- All D365 modules in scope covered?
- Edge cases, exceptions, and error handling defined?
- Integrations, reporting, and data migration requirements included where applicable?

**2. Must-Have Sections Present (★)**
- Object Inventory complete — all objects identified with category and complexity estimate?
- Form Design complete — all forms specified with field-level detail?
- Field Mapping complete — all fields mapped with EDT, mandatory/optional, validation rules?
- Business Rules and Validations complete — every rule with condition, error message, severity?
- Security Requirements complete — roles, menus, privileges, SoD?

**3. Alignment with D365 F&O Capabilities**
- Design leverages standard D365 F&O features where possible?
- Extension model followed (no overlayering suggested)?
- Over-engineering or misuse of the platform flagged?

**4. Risks and Issues**
- Functional gaps identified?
- Technical risks (performance, scalability, upgrade compatibility)?
- Integration and dependency risks?
- Data migration and data integrity risks?
- Security and compliance concerns?
- Upgrade (One Version) risks?

**5. Design Quality**
- Design modular, scalable, and maintainable?
- Assumptions clearly documented?
- Business rules and logic clearly defined — all testable?
- Process flows and data handling unambiguous?

**6. Open Questions**
- Ambiguities or missing details that need business confirmation?
- Conflicting or unclear requirements?

## Step 5 — Determine Status

Set status based on findings:
- **FDD APPROVED** — no BLOCKERs, all must-have sections (★) complete, no unresolved HIGH risks
- **NEEDS REWORK** — any BLOCKER present, any must-have section (★) incomplete, or HIGH risk without mitigation

## Step 6 — Write Review Report

Write to `docs/{requirement-name}/fdd-review.md`:

```markdown
---
requirement: {requirement-name}
reviewed-date: {YYYY-MM-DD}
status: FDD APPROVED | NEEDS REWORK
author: Claude Code (/fdd-review)
---

# FDD Review — {requirement-name}

## Status: FDD APPROVED / NEEDS REWORK

## Summary Assessment
- **Overall Completeness:** High / Medium / Low
- **Design Quality:** High / Medium / Low
- **Risk Level:** High / Medium / Low
- **Key Concerns:** (bullet list)

## Blockers *(must fix before TDD can proceed)*

| ID | Section | Issue |
|---|---|---|

## Required *(fix before re-review)*

| ID | Section | Issue |
|---|---|---|

## Completeness Gaps

| Area | Gap Description | Impact |
|---|---|---|

## Risks and Issues

| Category | Description | Severity | Recommendation |
|---|---|---|---|

## Open Questions

- Q1:
- Q2:

## Recommendations

- Improvement 1
- Improvement 2

## D365 Best Practice Observations

- Standard features not leveraged:
- Suggested alternatives:
```

## Step 7 — Print Summary

```
FDD REVIEW COMPLETE — {requirement-name}
════════════════════════════════════════
Status    : FDD APPROVED / NEEDS REWORK
Blockers  : {N}
Required  : {N}
Risks     : {N}
Output    : docs/{requirement-name}/fdd-review.md
```

If FDD APPROVED:
```
GATE PASSED — TDD and Test Plan may now be generated.
Next steps (can be run in parallel):
  /testplan {requirement-name}   ← generate test strategy and test cases from FDD
  /tdd {requirement-name}        ← generate IT System Design Specification
```

If NEEDS REWORK:
```
GATE BLOCKED — Fix all BLOCKERs in fdd.md and re-run /fdd-review.
```
