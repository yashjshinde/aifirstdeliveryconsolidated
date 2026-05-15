---
mode: agent
description: "Review a D365 CE functional spec and produce a structured review report. Use when the user wants to review or gate-check a spec before planning. Triggers on: 'review spec', 'review my feature', 'gate check', 'approve spec'."
---

Review a functional specification against the D365 CE constitution and produce a structured review report.

## Usage

```
/d365-ce-review {feature-name}
```

## Steps

1. Read all files in `constitution/`.
2. Read `specs/{feature-name}/spec.md` in full.

3. **Multi-Domain Detection — run first, before any other check.**
   Scan the spec for Azure Integration or Data Migration signals. If found, raise a BLOCKER immediately and stop:
   - **Integration signals:** "Azure Function", "Service Bus", "APIM", "Logic App", "event-driven pipeline", "sync from external", "publish to external", "DLQ", "dead-letter", "retry policy", "idempotent", "Bicep", "inbound webhook", "outbound to external system", "throughput SLA", "latency SLA"
   - **Data Migration signals:** "ADF", "Azure Data Factory", "SFTP", "staging table", "raw table", "ingest pipeline", "ADF data flow", "bulk upsert via ADF", "file-based batch load", "CSV file", "migration schedule", "nightly load", "error table", "stage promotion"
   - **BLOCKER text (Integration):** "This spec contains Azure Integration requirements that are out of scope for the D365 CE agent. Run `/d365-ce-split-spec {feature-name}` to separate the CE and integration portions before proceeding. The integration spec must then be handed to the Azure Integration agent."
   - **BLOCKER text (Data Migration):** "This spec contains Data Migration requirements (ADF pipelines, SFTP, staging) that are out of scope for the D365 CE agent. Run `/d365-ce-split-spec {feature-name}` to separate the CE and data migration portions before proceeding. The data migration spec must then be handed to the Data Migration agent."
   - Set status to `NEEDS REWORK` and stop.

4. **Brownfield Coherence Check** — check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
   If `true`:
   - Verify §14 Brownfield Context is present in the spec. If the spec references any entity schema name or component that exists in the brownfield inventory but §14 is absent, raise a REQUIRED: "Brownfield mode is enabled. Add §14 Brownfield Context listing all existing components touched by this spec."
   - For any component listed in §14 with action `EXTEND` or `REPLACE`: verify the relevant FR describes the *delta* (what changes), not just the end state. An FR that duplicates the brownfield doc without describing the change is a REQUIRED gap.
   If `false`: skip.

4b. **Cross-Feature Spec Scan** — informational only; does not block approval unless a hard CONFLICT is identified:
    - Read `plans/_component-registry.md` if it exists
    - Scan all D365 CE components listed in §6 Impact Summary against the registry (entity SchemaChanges, Plugin registrations, Flows, PCF controls, Security Roles)
    - For each match: log as INFORMATIONAL — record the owning feature, component name, and whether the actions are compatible
    - If a CONFLICT is detected (two features claiming incompatible modifications to the same component): raise as RECOMMENDED — "Component {name} is also claimed by feature {other-feature} with action {action}. Resolve the overlap before /d365-ce-plan to avoid deployment conflicts."
    - If no `_component-registry.md` exists or no matches found: note "No cross-feature overlaps detected at spec stage."
    - Record findings under a **Cross-Feature Overlaps** section in the review report

5. **Run the full review checklist** from `Prompts/review/checklist.md`. Evaluate every item. For each failing item record: severity (BLOCKER / REQUIRED / RECOMMENDED / QUESTION), the specific rule or section violated, and a clear remediation action.

6. **Generate the review report** using `specs/_review-template.md`. The report must include:
   - Summary: verdict, counts by severity
   - Checklist results grouped by category (Constitution rules, Spec Completeness)
   - For every BLOCKER and REQUIRED: description, affected section, remediation action
   - For RECOMMENDEDs and QUESTIONs: brief note, not blocking
   - Next steps based on verdict

7. **Determine status:**
   - `APPROVED` — zero BLOCKERs, zero REQUIREDs
   - `NEEDS REWORK` — one or more BLOCKERs or REQUIREDs
   - `DRAFT` — review not yet run

8. Write output to `specs/{feature-name}/review.md`.

9. Print the completion report (below).

## Severity Levels

| Level | Meaning | Effect on status |
|---|---|---|
| BLOCKER | Constitution violation or out-of-domain requirement | Sets NEEDS REWORK; blocks `/d365-ce-plan` |
| REQUIRED | Missing information that prevents technical planning | Sets NEEDS REWORK; blocks `/d365-ce-plan` |
| RECOMMENDED | Best-practice gap — should be addressed | Does not block |
| QUESTION | Needs business clarification before implementation | Does not block |

## Status Rules

- `APPROVED` — zero BLOCKERs, zero REQUIREDs. `/d365-ce-fdd`, `/d365-ce-testplan`, and `/d365-ce-plan` may proceed.
- `NEEDS REWORK` — one or more BLOCKERs or REQUIREDs. `/d365-ce-plan` refuses to proceed.
- `/d365-ce-fdd` may be started in parallel with review if the spec is substantially complete, but must not be marked final until review is APPROVED.

## Completion Report

```
REVIEW COMPLETE
═══════════════
Feature      : {feature-name}
Verdict      : APPROVED / NEEDS REWORK

Findings
  BLOCKERs     : {N}
  REQUIREDs    : {N}
  RECOMMENDEDs : {N}
  QUESTIONs    : {N}

Multi-domain check   : PASS / BLOCKER — {detail if triggered}
Cross-feature check  : CLEAR / {N} overlaps — {summary if any}

{If APPROVED:}
Output       : specs/{feature-name}/review.md
Next step    : /d365-ce-fdd {feature-name}

{If NEEDS REWORK:}
Output       : specs/{feature-name}/review.md
Resolve all BLOCKERs and REQUIREDs, then re-run /d365-ce-review {feature-name}.

Top issues:
  [BLOCKER] {section} — {description}
  [REQUIRED] {section} — {description}
```

## Rules

- **AI Notes:** In the generated review report, at the end of each finding entry (each BLOCKER, REQUIRED, and RECOMMENDED item), append `> **AI Notes** — {1–2 sentences: reasoning behind the severity classification, the specific rule applied, or the risk if left unresolved}`. Write only what is non-obvious — do not repeat the finding description.