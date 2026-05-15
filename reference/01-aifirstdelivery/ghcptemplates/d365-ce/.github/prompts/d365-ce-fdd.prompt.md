---
mode: agent
description: "Generate a Functional Design Document (FDD) for a D365 CE feature. Use when the user wants a formal FDD from an approved spec. Triggers on: 'FDD', 'functional design document', 'generate FDD', 'write FDD'."
---

Generate a Functional Design Document (FDD) for a D365 CE feature from an approved functional specification.

## Usage

```
/d365-ce-fdd {feature-name}
```

## Pre-condition Check

1. Read `specs/{feature-name}/review.md`.
2. If status is not `APPROVED`, stop: "Run /d365-ce-review first and resolve all BLOCKERs before generating the FDD."

## Steps

3. Read all files in `constitution/`.
4. Read `specs/{feature-name}/spec.md` in full.
5. Generate the FDD using the template at `doc-templates/fdd-template.md`. Every section in the template is mandatory — populate all of them. Do not remove or skip any section.
6. Write to `docs-generated/{feature-name}/functional-design-document.md`.
7. Print a section summary: sections written, FDD gaps flagged, stakeholder review items.

## Operating Principles

- Do NOT invent requirements or modify scope — only transform the spec into structured FDD format.
- Maintain strict traceability: Module → FR → Design Section → Acceptance Criteria.
- Use business language throughout — no code, no schema names, no Azure resource names.
- Every section must reference back to FR-NNN where applicable.
- Flag any functional gap discovered during elaboration as an **FDD Gap** in the Functional Gap Log.
- Ensure clarity for developers, testers, and business stakeholders.

## Content Guidance per Section

**§1 Document Control:** Start at version 1.0. Approvals table has four roles: Business Owner, IT Lead, Solution Architect, Project Manager — all Pending.

**§2 Introduction:** Purpose paragraph states this is the authoritative reference for build and UAT. Scope lists every module from the spec. Definitions table covers all abbreviations used.

**§3 System Overview:** High-Level Overview describes the solution without implementation detail. Personas table lists every actor from the spec including system actors; Primary Modules column references module numbers from §2.2.

**§4 Business Process:** Process Flow has minimum 8 numbered steps covering the full lifecycle — each step names the actor, describes the action or decision, notes exception paths, and references FR-NNN.

**§5 Functional Design:** One 5.X block per module. The 6-subsection structure is mandatory for every module:
- 5.X.1 Module Overview — scope and dependencies
- 5.X.2 FRs — every FR from the spec with Inputs / Outputs / Business Rules / Dependencies
- 5.X.3 Functional Logic — how all FRs work together as a narrative
- 5.X.4 Validation & Error Handling — validation rules and error responses per module
- 5.X.5 Acceptance Criteria — Given/When/Then, minimum one per FR; flag new ACs as FDD Gaps
- 5.X.6 Traceability — table linking FR Reference → Business Requirement → BR# → AC Ref

**§6 Data Considerations:** Key Entities table includes Source and Direction columns. Data Dependencies bullet list drives the implementation sequence.

**§7 Integration Overview:** One row per integration touchpoint. Add a note after the table for any data that must never flow in a given direction.

**§8 Security Considerations:** RBAC table covers all personas. Field-Level Security lists every restricted field with business justification. Data Visibility Constraints are bullet points.

**§9 D365 CE Specifics:** Form specs include tab/section/field/visibility. View specs include columns/filter/sort. Business Rules table has Condition / Action / Enforcement point / User Message. Security Matrix uses ✓ / — / BU / Org / User scope values.

**§10 Non-Functional Requirements:** Use specific numeric targets from the spec. Write "TBC in refinement" where not yet defined.

**§11 Assumptions & Constraints:** Assumptions are conditions the solution depends on. Constraints are hard boundaries.

**§12 Out of Scope:** Table format with Module column. Draw from spec out-of-scope section. Flag any new items as FDD Gaps.

**§13 Risks & Dependencies:** Key Risks table includes Impact and Mitigation. External Dependencies table includes Owner and Required By FR-NNN.

**Appendix A:** Every business requirement from the spec must appear. List all FR-NNNs that implement each BR.

## Rules

- FDD uses business language — no code, no schema names, no Azure resource names.
- Every FR from the spec must appear in §5.
- Every business requirement must appear in Appendix A.
- Flag any functional gap as an FDD Gap — do not silently omit ambiguous requirements.

## Completion Report

```
FDD COMPLETE
════════════
Feature      : {feature-name}
Modules      : {N} modules documented (§5)
FRs          : {N} functional requirements across all modules
Screens/Forms: {N} form/view designs in §9
Integrations : {N} integration touchpoints in §7
BR Rules     : {N} business rules in §9 (D365 CE Specifics)
Gaps         : {N} FDD Gaps logged
Output       : docs-generated/{feature-name}/functional-design-document.md
Next step: /d365-ce-testplan {feature-name}  or  /d365-ce-plan {feature-name}
```
