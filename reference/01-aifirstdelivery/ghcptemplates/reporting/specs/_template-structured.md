---
feature: {feature-name}
date: {YYYY-MM-DD}
status: DRAFT
intake: structured
l3-intake: required         # required (default) | optional — see constitution/10-alm-configuration.md
author: Claude Code (/spec-alm)
alm-ids:
  L1:
    - id: "{L1-ALM-ID}"
      title: "{L1 Title}"
  L2:
    - id: "{L2-ALM-ID}"
      title: "{L2 Title}"
  L3:
    - id: "{L3-ALM-ID}"
      title: "{L3 Title}"
      source: alm            # alm = provided by ALM tool | pending = no L3 given; /plan will generate
    # Example pending entry (l3-intake: optional only):
    # - id: "(pending)"
    #   title: "(to be defined during planning)"
    #   source: pending
    #   parent-l2: "{L2-ALM-ID}"
---

# Functional Specification — {Feature Display Name}

> **Project:** {Project Name}
> **Intake Mode:** Structured — enhanced from ALM work items
> **Version:** 1.0
> **Status:** Draft for Review

---

## Table of Contents

1. [Overview](#1-overview)
2. [Scope](#2-scope)
3. [Actors and Personas](#3-actors-and-personas)
4. [Business Process Overview](#4-business-process-overview)
5. [Functional Requirements by ALM Hierarchy](#5-functional-requirements-by-alm-hierarchy)
6. [Reporting Impact Summary](#6-reporting-impact-summary)
7. [Business Rules](#7-business-rules)
8. [Assumptions and Constraints](#8-assumptions-and-constraints)
9. [Open Questions](#9-open-questions)
10. [Constitution Risks](#10-constitution-risks)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Document Control](#12-document-control)
13. [ALM Traceability Matrix](#13-alm-traceability-matrix)

---

## 1. Overview

**Business Objective:**
{Derived from the L1 work item title and description — one paragraph on what the reporting feature achieves and why.}

**Reporting Stack:** Power BI | SSRS / Paginated Reports | Azure Analysis Services | Dataverse / D365 Data

**Success Criteria:**
- {Measurable outcome derived from L1/L2 descriptions}
- {Measurable outcome}

---

## 2. Scope

### In Scope
- {Each L2 item represents a scope boundary — list them here}

### Out of Scope
- {Explicitly excluded items — never leave blank}

---

## 3. Actors and Personas

| Persona | Role in Feature | Security Role / RLS Role |
|---|---|---|
| {Persona} | {What they do} | {Security Role / RLS Role Name} |

---

## 4. Business Process Overview

<!-- GENERATOR: Describe the end-to-end reporting workflow in numbered steps, referencing L2 functional areas.
     Include data flow from source system → dataset/dataflow → report → consumer. -->

1. {Step — data source or trigger event}
2. {Step — dataset refresh / transformation / calculation}
3. {Step — report rendered, distributed, or embedded}
4. {Step — consumer action or downstream outcome}

---

## 5. Functional Requirements by ALM Hierarchy

<!-- GENERATOR: Requirements are grouped by the imported L1/L2/L3 ALM hierarchy. Each L3 work item is
     enhanced with FR-NNN requirements, acceptance criteria, and Reporting Impact. FR numbers are sequential
     across the entire spec — they do not reset per L2 or L3. Every L3 ALM ID maps to at least one FR-NNN. -->

---

### {L1-Type}: {L1-ALM-ID} — {L1 Title}

**ALM ID:** {L1-ALM-ID}
**Original Description:** {verbatim text as imported from ALM}

---

#### {L2-Type}: {L2-ALM-ID} — {L2 Title}

**ALM ID:** {L2-ALM-ID}
**Original Description:** {verbatim text as imported from ALM}

---

##### {L3-Type}: {L3-ALM-ID} — {L3 Title}

**ALM ID:** {L3-ALM-ID}
**Original Story / Description:** {verbatim text as imported from ALM}

---

###### FR-001 — {Enhanced Requirement Title}

**Description:** {What the system must do — clear, implementation-ready language.}

**Trigger:** {User action, scheduled refresh, data event, or integration event that starts this.}

**Inputs:**
- {Data source, table, API feed, or user filter selection}

**Outputs:**
- {Report page, visual, export, alert, or embedded view produced}

**Business Rules:**
- BR-001: {Rule — e.g., RLS must filter by security role; revenue figures rounded to 2 decimal places}

**Reporting Impact:**
- **Dataset / Dataflow:** {Dataset or dataflow name — new or modified; source tables and relationships}
- **Report / Page:** {Report name and page — new or modified}
- **DAX Measures:** {Measure names and brief description of logic — new or modified}
- **RLS Roles:** {Row-level security role names and filter logic applied}
- **Workspace:** {Power BI workspace or SSRS report server path}
- **SSRS / Paginated:** {Paginated report name and delivery method if applicable}

**Story Decomposition Guidance:**
- **Suggested Actors:** {Who consumes or triggers this report}
- **Suggested User Intent:** {What the persona is trying to analyse or decide}
- **Suggested System Actions:** {Sequence: refresh trigger → transform → render → distribute}
- **Possible Story Splits:** {By report page / by dataset / by RLS role / by delivery channel}

**Dependencies:**
- **Upstream:** {FR-NNN or data source / integration this depends on}
- **Downstream:** {FR-NNN or consumer process that depends on this}

**Non-Functional Considerations:**
- **Performance:** {e.g., report load < 3 seconds; dataset refresh < 30 min; DAX query < 2 seconds}
- **Security:** {e.g., RLS enforced; no row leakage across security boundaries; workspace access restricted}
- **Scalability:** {e.g., dataset handles 5M+ rows; incremental refresh configured for large tables}
- **Reliability:** {e.g., refresh failure triggers alert; paginated report retry on timeout}

**Traceability:** {L3-ALM-ID} — {L3 Title}

---

###### FR-002 — {Next Requirement Title}

*(repeat FR block structure)*

---

*(Repeat L3 block for each imported User Story / L3 work item)*

*(If `l3-intake: optional` and this L2 has no L3 items — use this pending placeholder instead of a L3 block):*

---

##### *(Pending) {L3-Type}: to be defined during planning*

**ALM ID:** *(pending)*
**Parent L2:** {L2-ALM-ID} — {L2 Title}
**Status:** No L3 work items were provided for this L2 branch.
`/plan` will decompose this L2 into {L3-Type} stories and generate Tasks under them.

---

*(Repeat L2 block for each imported Epic / L2 work item)*

*(Repeat L1 block for each imported Feature / L1 work item)*

---

## 6. Reporting Impact Summary

| Component | Name / Object | Change Type | Notes |
|---|---|---|---|
| Dataset | `{DatasetName}` | New / Modified | {source tables, refresh schedule} |
| Dataflow | `{DataflowName}` | New / Modified | {transformation logic note} |
| Report | `{ReportName}` | New / Modified | {pages affected} |
| DAX Measure | `{MeasureName}` | New / Modified | {brief logic note} |
| RLS Role | `{RoleName}` | New / Modified | {filter expression note} |
| Workspace | `{WorkspaceName}` | New / Modified | {environment note} |
| SSRS Report | `{ReportPath}` | New / Modified | {delivery method note} |

---

## 7. Business Rules

| Rule ID | Rule Description | Enforcement Point |
|---|---|---|
| BR-001 | {Rule} | DAX Measure / RLS Filter / Power Automate / Dataset Transform |
| BR-002 | {Rule} | {Enforcement Point} |

---

## 8. Assumptions and Constraints

**Assumptions:**
- {Assumption derived from ALM item context or project environment}

**Constraints:**
- {Constraint — e.g., Power BI Premium capacity required for paginated reports; incremental refresh needs import mode}

---

## 9. Open Questions

| Q# | Question | ALM ID Ref | Raised By | Status |
|---|---|---|---|---|
| Q-001 | {Ambiguity from ALM item description that could not be resolved by inference} | {L3-ALM-ID} | Spec Agent | Open |

---

## 10. Constitution Risks

| Risk ID | Description | Proposed Alternative |
|---|---|---|
| CR-001 | {Potential constitution conflict — e.g., delegation-unsafe filter, RLS bypass risk} | {Compliant approach} |

---

## 11. Acceptance Criteria

Write testable scenarios using Given / When / Then, linked to their originating L3 ALM ID.

**{L3-ALM-ID} — {L3 Title}**
- **Given** {precondition}, **When** {action or filter applied}, **Then** {expected report output}.
- **Given** {precondition}, **When** {error condition or RLS boundary}, **Then** {expected error handling or data restriction}.

*(Add one or more scenarios per L3 work item)*

---

## 12. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/spec-alm) | Enhanced from ALM structured intake |

---

## 13. ALM Traceability Matrix

<!-- GENERATOR: Maps each imported ALM ID to the FR-NNN requirements generated from it.
     Used by /plan (structured mode) to map Tasks back to their parent L3 ALM IDs.
     The Source column indicates whether the L3 came from the ALM tool (alm) or is pending generation by /plan (pending). -->

| L1 ALM ID | L2 ALM ID | L3 ALM ID | L3 Title | Source | FR References | BR References |
|---|---|---|---|---|---|---|
| {L1-ALM-ID} | {L2-ALM-ID} | {L3-ALM-ID} | {L3 Title} | alm | FR-001, FR-002 | BR-001 |
| {L1-ALM-ID} | {L2-ALM-ID} | *(pending)* | *(to be defined in /plan)* | pending | — | — |
