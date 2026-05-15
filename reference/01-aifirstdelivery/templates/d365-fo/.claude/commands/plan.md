Generate a task-level implementation plan from an approved TDD. Unlike other templates, the D365 F&O plan operates at object level only — one task per X++ object or configuration item. There is no Feature/Epic/Story hierarchy; every item is directly implementable.

## Usage

```
/plan {requirement-name}
```

---

## Step 1 — Load Constitution

Read every file in `constitution/` before proceeding.

## Step 2 — Check Gate

Read `docs/{requirement-name}/tdd-review.md`.

If status is not `TDD APPROVED`, stop:
```
GATE BLOCKED
════════════
TDD review status is not TDD APPROVED.
Run /tdd-review {requirement-name} and resolve all BLOCKERs before generating the plan.
```

## Step 3 — Read TDD

Read `docs/{requirement-name}/tdd.md`.

Extract every X++ object from Section 5 (Architecture):
- Form Extensions and New Forms (§5.3)
- Data Dictionary objects — Enums, EDTs, Queries, Views, Data Entities, Tables (§5.4)
- SSRS Reports (§5.5)
- Business Logic Classes (§5.6)
- Interface Logic Classes (§5.7)
- Workflows (§5.8)
- Security objects — Privileges, Duties (§5.9)
- Label Files (§5.10)
- Integration / Interface components (§5.11)

For each object:
- Assign an Object-ID using the correct category prefix (EXT-NNN, DEN-NNN, INT-NNN, etc.)
- Map to the correct object category (Extensions, Data Entities, Integrations, etc.)
- Identify the specific extension type from the 32-type catalogue in constitution/03-extension-coding-standards.md
- Assign complexity (Very Simple / Simple / Medium / Complex / Very Complex) and T-shirt size
- Identify dependencies on other objects in this plan (e.g., EDT must exist before Table Extension references it)

**Sequencing rules:**
- EDTs and Base Enums before Table Extensions and Form Extensions that reference them
- New Tables before Class Extensions that query them
- Security Privileges before Security Duties; Duties before Roles
- Data Entities after their base Table Extensions
- Integration classes after the Data Entities they depend on

## Step 3b — Cross-Feature Dependency Scan

Scan existing feature plans before generating any content:
- List all subdirectories in `plans/` (skip `_template.md`, `_component-registry.md`)
- For each subdirectory that has a `plan.md`, read its **Object Summary table** (Object Name and Object Type columns)
- Read `plans/_component-registry.md` if it exists
- Extract all D365 F&O X++ objects claimed by other features: Table Extensions (EXT-NNN), Form Extensions, Data Entities (DEN-NNN), Business Logic Classes, Security Privileges and Duties, Integration classes
- Compare against the X++ objects extracted from this TDD's Section 5 to find shared objects
- Classify each overlap:
  - **CONFLICT** — incompatible change to the same object (e.g., two features both extend the same table and add a field with the same name, or two features register conflicting event handler logic on the same form)
  - **SEQUENTIAL** — this feature depends on another feature's object existing first (e.g., this class calls a method on a new Data Entity that another feature's plan creates)
  - **SHARED** — both features reference the same object without conflicting modifications (informational only)
- Record all findings. If no other `plan.md` exists: note "First feature in this application — no existing plans to scan."
- Results populate the **Cross-Feature Dependencies** section in the plan output.

## Step 4 — Generate Plan

Generate `plans/{requirement-name}/plan.md` using `plans/_template.md`.

The plan contains:
- **Object Summary table** — one row per object with columns: Object-ID, ALM ID (set to `*(pending)*`), Object Name, Category, Object Type, Module, Complexity, T-Shirt, Story Pts, FDD Rules, Depends On. The Epic-level ALM ID is also shown as `**ALM ID (Epic):** *(pending)*` above the table.
- **Recommended Implementation Sequence** — objects in dependency order with brief reason where not obvious.
- **Object Details** — one `###` section per object with a two-column table containing all fields. Every object detail block includes an **ALM ID** row set to `*(pending)*`.
- **Cross-Feature Dependencies** — findings from Step 3b. Table with columns: Feature / Plan | Object Name | Overlap Type (CONFLICT / SEQUENTIAL / SHARED) | Recommended Action. Write "No cross-feature overlaps found." if none.
- **Dependency Mapping** — object-to-object and environment dependency tables.
- **Document Control** — version, date, author.

Fields for each object detail block:

| Field | Value |
|---|---|
| Object-ID | {e.g., EXT-001} |
| ALM ID | *(pending)* |
| Object Category | {one of 10 categories} |
| Object Type | {one of 32 extension types, or specific type} |
| Object Name | {technical name following naming convention} |
| Module | {module code} |
| Complexity | {Very Simple / Simple / Medium / Complex / Very Complex} |
| T-Shirt | {XS / S / M / L / XL} |
| Story Points | {XS=0.5  S=1  M=3  L=8  XL=20} |
| FDD Reference | {FDD section} |
| FDD Rules | {Rule-IDs this object implements, e.g. BR-001, BR-002} |
| TDD Reference | {TDD section 5.x.x} |
| Depends On | {Object-IDs this object requires to exist first, or "—"} |
| Description | {one-sentence description of what this object does} |
| Priority | {High / Medium / Low} |

For each object detail block, append an AI Notes callout after the object table:
`> **AI Notes** — {1–2 sentences: key design decision for this object, complexity flag, or dependency assumption}`

## Step 5 — Generate work-items.yaml

Generate `plans/{requirement-name}/work-items.yaml` using `plans/_work-items-template.yaml` as the base.

For every object in the plan, create a work item. Assign:
- `uid = "{requirement-name}-{Object-ID}"` (e.g., `"qms-validation-EXT-001"`)
- `alm-id: null`
- Level 1 = the overall Requirement/Epic
- Level 2 = each individual object task

If `work-items.yaml` already exists, preserve all existing `uid` values and any non-null `alm-id` values — never overwrite them.

## Step 6 — Write Outputs

Write:
- `plans/{requirement-name}/plan.md`
- `plans/{requirement-name}/work-items.yaml`

## Step 6b — Update Component Registry

Update `plans/_component-registry.md`:
- If the file does not exist, create it with this header row:
  `| Feature | Agent | Component Type | Component Name | Action | Plan Path |`
- For each X++ object in this plan's Object Summary table, add or update one row:
  - **Feature**: `{requirement-name}`
  - **Agent**: `d365-fo`
  - **Component Type**: use the Object Category from Step 3 (e.g., TableExtension | FormExtension | DataEntity | Class | SecurityPrivilege | SecurityDuty | SSRS | Integration | Workflow | Enum | EDT)
  - **Component Name**: exact Object Name from the plan
  - **Action**: NEW (all F&O objects are new X++ artefacts unless TDD explicitly states EXTEND on an existing object)
  - **Plan Path**: `plans/{requirement-name}/plan.md`
- UPSERT logic: if a row for this requirement + object already exists, update it; if it is new, append it
- Never delete or modify rows belonging to other features

## Step 7 — Print Completion Report

```
PLAN COMPLETE
══════════════
Requirement : {requirement-name}
Objects     : {N} total  ({breakdown by category})
Sequence    : {N} implementation steps
Output      : plans/{requirement-name}/plan.md
              plans/{requirement-name}/work-items.yaml

Next step: /plan-review {requirement-name}
```
