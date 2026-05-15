Review a Power Platform functional specification against the Power Apps constitution and produce a structured review report.

## Usage

```
/review {feature-name}
```

## Steps

1. Read all files in `constitution/`.
2. Read `specs/{feature-name}/spec.md` in full.

3. **Multi-Domain Detection — run first, before any other check.**
   Scan the spec for Azure Integration or Data Migration signals. If found, raise a BLOCKER immediately and stop:
   - **Integration signals:** "Azure Function", "Service Bus", "APIM", "Logic App", "event-driven pipeline", "sync from external system", "publish to external", "DLQ", "dead-letter", "retry policy", "idempotent", "Bicep", "inbound webhook from external", "outbound to external API", "throughput SLA", "latency SLA"
   - **Data Migration signals:** "ADF", "Azure Data Factory", "SFTP", "staging table", "raw table", "ingest pipeline", "ADF data flow", "bulk upsert via ADF", "file-based batch load", "CSV file", "migration schedule", "nightly load", "error table", "stage promotion"
   - **BLOCKER text (Integration):** "This spec contains Azure Integration requirements that are out of scope for the Power Apps agent. Run `/split-spec {feature-name}` to separate the Power Apps and integration portions before proceeding. The integration spec must then be handed to the Azure Integration agent."
   - **BLOCKER text (Data Migration):** "This spec contains Data Migration requirements (ADF pipelines, SFTP, staging) that are out of scope for the Power Apps agent. Run `/split-spec {feature-name}` to separate the Power Apps and data migration portions before proceeding. The data migration spec must then be handed to the Data Migration agent."
   - Set status to `NEEDS REWORK` and stop.

3b. **Brownfield Coherence Check** (only if `brownfield.enabled: true` in `constitution/10-alm-configuration.md`):
    - Check §15 Brownfield Context is present if any existing Power Platform components are referenced.
    - Check that FRs describing EXTEND or REPLACE actions describe the **delta** (what changes), not the full end-state spec.
    - Flag as REQUIRED if §15 is absent but brownfield mode is enabled and existing components are referenced.
    - Flag as RECOMMENDED if EXTEND/REPLACE FRs don't distinguish new from existing behaviour.

3c. **Cross-Feature Spec Scan** — informational only; does not block approval unless a hard CONFLICT is identified:
    - Read `plans/_component-registry.md` if it exists
    - Scan all Power Platform components listed in §6 Power Platform Impact Summary against the registry (Dataverse tables, Canvas App screens, MDA forms/views, Flows, Copilot topics, Security Roles)
    - For each match: log as INFORMATIONAL — record the owning feature, component name, and whether the actions are compatible
    - If a CONFLICT is detected (two features claiming incompatible modifications to the same component): raise as RECOMMENDED — "Component {name} is also claimed by feature {other-feature} with action {action}. Resolve the overlap before /plan to avoid deployment conflicts."
    - If no `_component-registry.md` exists or no matches found: note "No cross-feature overlaps detected at spec stage."
    - Record findings under a **Cross-Feature Overlaps** section in the review report

4. **Run the full review checklist** from `Prompts/review/checklist.md`. Evaluate every item. For each failing item record: severity (BLOCKER / REQUIRED / RECOMMENDED / QUESTION), the specific rule or section violated, and a clear remediation action.

5. **Generate the review report** using `specs/_review-template.md`. The report must include:
   - Summary: verdict, counts by severity
   - Checklist results grouped by category (Constitution rules, Spec Completeness)
   - For every BLOCKER and REQUIRED: description, affected section, remediation action
   - For RECOMMENDEDs and QUESTIONs: brief note, not blocking
   - Next steps based on verdict

6. **Determine status:**
   - `APPROVED` — zero BLOCKERs, zero REQUIREDs
   - `NEEDS REWORK` — one or more BLOCKERs or REQUIREDs
   - `DRAFT` — review not yet run

7. Write output to `specs/{feature-name}/review.md`.

8. Print the completion report (below).

## Severity Levels

| Level | Meaning | Effect on status |
|---|---|---|
| BLOCKER | Constitution violation or out-of-domain requirement | Sets NEEDS REWORK; blocks `/plan` |
| REQUIRED | Missing information that prevents technical planning | Sets NEEDS REWORK; blocks `/plan` |
| RECOMMENDED | Best-practice gap — should be addressed | Does not block |
| QUESTION | Needs stakeholder clarification before implementation | Does not block |

## Status Rules

- `APPROVED` — zero BLOCKERs, zero REQUIREDs. `/fdd`, `/testplan`, and `/plan` may proceed.
- `NEEDS REWORK` — one or more BLOCKERs or REQUIREDs. `/plan` refuses to proceed.
- `/fdd` may be started in parallel with review if the spec is substantially complete, but must not be marked final until review is APPROVED.

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
Next step    : /fdd {feature-name}

{If NEEDS REWORK:}
Output       : specs/{feature-name}/review.md
Resolve all BLOCKERs and REQUIREDs, then re-run /review {feature-name}.

Top issues:
  [BLOCKER] {section} — {description}
  [REQUIRED] {section} — {description}
```

## Rules

- **AI Notes:** In the generated review report, at the end of each finding entry (each BLOCKER, REQUIRED, and RECOMMENDED item), append `> **AI Notes** — {1–2 sentences: reasoning behind the severity classification, the specific rule applied, or the risk if left unresolved}`. Write only what is non-obvious — do not repeat the finding description.