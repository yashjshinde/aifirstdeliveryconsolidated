# /fdd — Generate Functional Overview Document

Produce a business-readable Functional Overview Document from the project inventory and component docs.
Describes what the system does — not how it is built.

## Usage

```
/fdd
```

## Pre-condition Check

1. Read `docs-generated/component-inventory.md`.
   If it does not exist, stop: "Run `/scan` first."
2. Read `docs-generated/functional/entity-catalogue.md` if it exists.
3. Read `docs-generated/functional/flows.md` if it exists.
4. Read `docs-generated/functional/security-model.md` if it exists.
5. Read all files in `input/documents/` — provided documents take priority for business context and intent.

## Steps

6. Read all files in `constitution/`.
7. Generate the Functional Overview Document using `doc-templates/functional-overview-template.md`.
8. Write to `docs-generated/functional/functional-overview.md`.
9. Print completion report.

## What the Document Must Cover

### §1 Document Control
Solution name and version (from inventory), publisher, date generated.
Status: DRAFT — for stakeholder review.

### §2 Executive Summary
2–4 paragraphs: what this project does, which business processes it supports, which user groups it serves.
Written for a non-technical business stakeholder. No schema names, no Azure resource names.

### §3 Business Context
- Organisation / team served
- Business problem or capability addressed
- Systems connected to (business names only)
- Key business outcomes supported

### §4 User Personas
Table: Persona | Description | Primary Activities | Security Role(s)
Infer personas from security role names. Flag unknown roles as `⚠ UNCLEAR PERSONA`.

### §5 Business Processes Supported
Infer processes from entity relationships, flow names, plugin triggers, classic workflow names.
One subsection per process: trigger, actors, steps (business language), outcome, automated vs manual steps.

For each process, include a Mermaid `flowchart LR` showing the high-level steps. Use business language only — no schema names. Mark automated steps with `:::ok` and manual steps with `:::neutral`.

Example structure:
````mermaid
flowchart LR
  T([Trigger]) --> S1[Step 1]:::ok --> S2[Step 2]:::neutral --> S3[Step 3]:::ok --> O([Outcome])
  classDef ok      fill:#00aa55,color:#fff,stroke:#007733
  classDef neutral fill:#f0f0f0,color:#333,stroke:#999
````

### §6 Data Subjects and Key Information
Key entities by business name with plain-English description of what they hold and how they relate.
Flag any fields that suggest sensitive data (names containing `dob`, `ssn`, `bank`, `gdpr`, `passport`).

### §7 Automation Summary
Table of all flows and classic workflows: Business Name | Trigger | What it does | Type.
Group by process where possible.

### §8 Integration Summary (Business View)
Per external system: name, direction, data exchanged, frequency.

Include a Mermaid `graph LR` showing the system and all connected external systems with labelled arrows (data exchanged, direction). Use business names only — no endpoint URLs or schema names. Apply `:::info` to external systems.

````mermaid
graph LR
  SYS["{System Name}"]
  ExtA["{External System A}"]:::info
  ExtB["{External System B}"]:::info
  ExtA -- "{data exchanged}" --> SYS
  SYS -- "{data exchanged}" --> ExtB
  classDef info fill:#0066cc,color:#fff,stroke:#004499
````

### §9 User Interface Highlights
Key forms described in plain language. Notable PCF controls and what experience they provide.

### §10 Security Summary (Business View)
Role names with one-sentence purpose each. Restricted-access data in plain language.

### §11 Known Gaps and Outstanding Questions
All `⚠ NEEDS REVIEW` items from the inventory that affect business understanding.

## Operating Principles

- Business language only — no schema names, class names, or Azure resource names.
- Infer intent from evidence. Mark inferences as *(inferred)*.
- Source provided documents with *(from: {filename})*.
- Do not speculate beyond what the artefacts evidence.

## Completion Report

```
FDD COMPLETE
════════════
Project      : {project-name}
Processes    : {N} business processes documented
Personas     : {N} user personas identified
Key Entities : {N} data subjects described
Automations  : {N} flows/workflows summarised
Integrations : {N} external systems described
Gaps         : {N} items flagged ⚠ NEEDS REVIEW
Output       : docs-generated/functional/functional-overview.md

Next steps: /tdd  |  /blueprint  |  /index
```
