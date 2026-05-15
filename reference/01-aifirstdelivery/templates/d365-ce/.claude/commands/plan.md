Generate a technical plan for a D365 CE feature from an approved functional specification.
Produces two outputs: a human-readable plan.md and a machine-readable work-items.yaml for ALM sync.

## Pre-condition Check

1. Read `specs/{feature-name}/review.md`.
2. If status is not `APPROVED`, stop: "This spec has not been approved. Run `/review` first and resolve all BLOCKERs and REQUIREDs."

2b. **Brownfield Check** — check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `true`:
    - Check `specs/{feature-name}/impact-analysis.md` exists. If not, stop: "Brownfield mode is enabled. Run `/impact {feature-name}` before planning."
    - Read `specs/{feature-name}/impact-analysis.md` — load the `brownfield-action` for every component.
    - Read `{brownfield.docs-path}/technical/technical-overview.md` if it exists — use as architectural baseline.
    If `false`: skip.

## Steps

3. Read all files in `constitution/` including `10-alm-configuration.md`.
4. Read `specs/{feature-name}/spec.md`.

4b. Check `requirement-intake` in `constitution/10-alm-configuration.md`.
    - If `structured` (or if the spec front matter contains `intake: structured`): skip steps 6–9 and jump to **STRUCTURED MODE** at the bottom of this command.
    - If `unstructured` (default): continue with step 5 and the standard decomposition below.

4c. **Cross-Feature Dependency Scan** — scan existing feature plans before generating any content:
    - List all subdirectories in `plans/` (skip `_template.md`, `_component-registry.md`)
    - For each subdirectory that has a `plan.md`, read its **Section 2 — Task Inventory** (Artefacts column)
    - Read `plans/_component-registry.md` if it exists
    - Extract all D365 CE components claimed by other features: entity SchemaChanges, Plugin step registrations, Power Automate flows, PCF controls, Security Roles
    - Compare against this spec's **§6 D365 CE Impact Summary** to find shared components
    - Classify each overlap:
      - **CONFLICT** — incompatible change to the same component (e.g., two features both add a field with the same schema name to the same entity, or both register a PreCreate plugin on Account with conflicting logic)
      - **SEQUENTIAL** — this feature depends on another feature's component existing first (e.g., this feature's plugin reads a custom field that another feature's SchemaChange task creates)
      - **SHARED** — both features reference the same component without conflicting modifications (informational only)
    - Record all findings. If no other `plan.md` exists: note "First feature in this application — no existing plans to scan."
    - Results populate **Section 4a — Cross-Feature Dependencies** in the plan output.

5. From `constitution/10-alm-configuration.md`, read the work item hierarchy and ID prefixes:
   - Level 1 type and prefix (e.g., Epic / EP)
   - Level 2 type and prefix (e.g., Feature / FT)
   - Level 3 type and prefix (e.g., User Story / US)
   - Level 4 type and prefix (e.g., Task / T)

6. Decompose the spec into four levels using these ALM type names as labels throughout:
   ```
   {Level-1 type}  (Business Capability — one per major business area)
     └─ {Level-2 type}  (Functional Grouping — e.g., Plugin Dev, Schema, Security)
          └─ {Level-3 type}  (As a {persona}, I want {action}, so that {value})
                └─ {Level-4 type}  (WHAT to build — no code, no formulas)
   ```

7. For each Level-1 item ({L1-Type}), write:
   - **Description**: one paragraph on the business capability delivered
   - **FR Coverage**: list of FR-NNN in scope
   - **Success Criteria**: 2–5 measurable outcomes that define "done" at capability level (drawn from spec acceptance criteria and FR outputs)
   - **Module Architecture Summary**: 2–3 sentences on which D365 CE extension points will be used and why, plus a text data-flow line (`Source → Component → Target`). This is an architectural decision, not a full technical design — the TDD covers the detail.

8. For each Level-4 item (implementation task), identify:
   - Component type: Plugin | WebResource | PCF | SchemaChange | Flow | Configuration
   - D365 CE artefacts affected (entity, form, view, step registration, etc.)
   - Dependencies on other tasks (by task ID)
   - Estimated complexity: S | M | L | XL
   - Priority: High | Medium | Low (derived from business priority in spec)
   - FR references: one or more FR-NNN from the spec
   - **Role**: Developer | Functional | QA
   - **Type**: Dev | Config | Flow | Security | Testing | UX | DevOps | Integration

   **Unit test tasks (mandatory — generate one per testable component):**
   For every Plugin, WebResource, or PCF task: generate a paired unit test task with:
   - Title: "Unit tests for {L4-Prefix}-NNN — {component name}"
   - Component type: Configuration
   - Role: QA | Type: Testing
   - Dependency: the implementation task it tests
   - Complexity: S (unless the implementation task is L or XL, then M)
   - FR references: same as the paired implementation task

   For every Flow task: generate a paired flow test task with:
   - Title: "Flow tests for {L4-Prefix}-NNN — {FlowName}"
   - Component type: Configuration
   - Role: QA | Type: Testing
   - Dependency: the flow task it tests
   - Complexity: S
   - FR references: same as the paired flow task

9. Assign sequential IDs using the configured prefixes from `10-alm-configuration.md`:
   - Level 1: {L1-Prefix}-001, {L1-Prefix}-002, …
   - Level 2: {L2-Prefix}-001, {L2-Prefix}-002, …
   - Level 3: {L3-Prefix}-001, {L3-Prefix}-002, …
   - Level 4: {L4-Prefix}-001, {L4-Prefix}-002, …

10. Write `plans/{feature-name}/plan.md` using `plans/_template.md`.
    Replace every `{L1-Type}`, `{L2-Type}`, `{L3-Type}`, `{L4-Type}` placeholder with the ALM type names from `10-alm-configuration.md`.
    Replace every `{L1-Prefix}`, `{L2-Prefix}`, `{L3-Prefix}`, `{L4-Prefix}` with the corresponding ID prefixes.
    The plan uses a nested hierarchy in Section 1, followed by supporting sections:

    **Section 1 — Work Breakdown (fully nested hierarchy)**
    Structure: `##` for each {L1-Type} → `###` for each {L2-Type} → `####` for each {L3-Type} → `##### Tasks` table under each {L3-Type}.
    Each {L1-Type} block includes: **ALM ID:** *(pending)*, Description, FR Coverage, Success Criteria, Module Architecture Summary + Data Flow.
    Each {L2-Type} block includes: **ALM ID:** *(pending)*, Description, FR Coverage.
    Each {L3-Type} block includes: **ALM ID:** *(pending)*, As a / I want to / So that, Mapped FR, Acceptance Criteria (Given/When/Then — minimum 2).
    Each Tasks table columns: Task ID | ALM ID | Title | Component Type | Artefacts | Dependencies | Complexity | Role | Type. Every task row has **ALM ID:** *(pending)* in its cell.

    **Section 2 — Task Inventory**
    Consolidated table: Task ID, ALM ID, {L1-Type}, {L2-Type}, {L3-Type}, Title, Component Type, Complexity, Role, Type, FR Ref. Totals by complexity and role.

    **Section 3 — Implementation Sequence**
    Phase 1 = all SchemaChange + security tasks; Phase 2 = plugins and flows; Phase 3 = UX/config; Phase 4 = testing. Reference specific task IDs in each phase.

    **Section 4a — Cross-Feature Dependencies**
    Findings from the scan in step 4c. For each overlap: feature name, component, overlap type (CONFLICT / SEQUENTIAL / SHARED), and recommended action. If none: "No cross-feature overlaps found."

    **Section 4 — Dependency Mapping**
    {L3-Type}-to-{L3-Type}, task-to-task, integration, and environment dependency tables.

    **Section 5 — FR → {L3-Type} → Task Traceability**
    One row per FR: FR, {L1-Type}, {L3-Type}s, Key Task IDs — every FR from the spec must appear.

    **Section 6 — Constitution Exception Requests**
    One row per exception; "None identified." if none.

    **Section 7 — Document Control**
    Version 1.0, date, author.

    **Section 8 — Brownfield Impact** *(include only when `brownfield.enabled: true`)*
    - Summary table from `impact-analysis.md`: Component | Action | Change Description | Risk | Related Task IDs
    - For every REPLACE component: explicitly state what existing behaviour is preserved and what is overwritten.
    - For every CONFLICT: state the resolution approach adopted in this plan.

11. Write `plans/{feature-name}/work-items.yaml` using `plans/_work-items-template.yaml`.
    - Every item at all four levels must appear as an entry
    - Fill: id, level, alm-type, title, description, priority, fr-refs, parent, children
    - For Level 3 ({L3-Type}): include acceptance-criteria and story-points
    - For Level 4 ({L4-Type}): include component-type, complexity, status: TODO, validation-status: NOT VALIDATED, impl-doc-path: null, brownfield-action: NEW (or the value from impact-analysis.md if brownfield mode is enabled)
    - For every item: set uid = "{feature-name}-{item-id}" (e.g., "{feature-name}-{L4-Prefix}-001")
    - For every item: set alm-id: null
    - **If work-items.yaml already exists**: preserve all existing uid values and alm-id values unchanged — only update content fields (title, description, etc.). Never overwrite a uid or a non-null alm-id.

12. Update `plans/_component-registry.md`:
    - If the file does not exist, create it with this header row:
      `| Feature | Agent | Component Type | Component Name | Action | Plan Path |`
    - For each D365 CE component claimed in this plan (entity SchemaChanges, Plugin step registrations, Power Automate flows, PCF controls, Security Roles), add or update one row:
      - **Feature**: `{feature-name}`
      - **Agent**: `d365-ce`
      - **Component Type**: SchemaChange | Plugin | Flow | PCF | SecurityRole | WebResource | Configuration
      - **Component Name**: exact schema name, step name, flow name, or role name
      - **Action**: NEW | EXTEND | REPLACE (from impact-analysis.md if brownfield; otherwise NEW)
      - **Plan Path**: `plans/{feature-name}/plan.md`
    - UPSERT logic: if a row for this feature + component already exists, update it; if it is new, append it
    - Never delete or modify rows belonging to other features

13. Print a summary:
    - Level 1 count, Level 2 count, Level 3 count, Level 4 count
    - Complexity breakdown (S/M/L/XL counts)
    - Role breakdown (Developer/Functional/QA counts)
    - Priority breakdown (High/Medium/Low counts)
    - Any Constitution Exception Requests flagged

## Rules

- Level-4 items are **design-level** — WHAT to build, never HOW to code it.
- Every Level-4 item must trace to at least one FR-NNN.
- Flag any item requiring a constitution exception as a **Constitution Exception Request**.
- Schema tasks must appear before any plugin or flow task that depends on those tables — enforce this in the Implementation Sequence.
- The Module Architecture Summary is a planning-level architectural decision, not a TDD. It must not contain code, formulas, or implementation detail.
- The Implementation Sequence must be internally consistent with the task dependency table — no task can appear in a phase before its dependencies are resolved.
- work-items.yaml is a companion to plan.md — both must be consistent. The YAML fields are the machine-readable record; plan.md is the human-readable view of the same data.
- **AI Notes:** At the end of each {L1-Type} and {L2-Type} description block, append `> **AI Notes** — {1–2 sentences: decomposition rationale, architectural decision made, or exception taken}`.

---

## STRUCTURED MODE

*Entered when `requirement-intake: structured` in `constitution/10-alm-configuration.md`
or when the spec front matter contains `intake: structured`.*

In structured mode the L1/L2/L3 work items already exist in the ALM tool.
`/plan` must NOT create new L1/L2/L3 items — it generates **Task-level (L4) items only**,
grouped under their parent L3 ALM IDs as read from `specs/{feature-name}/spec.md` §13.

### What changes in structured mode

| Standard mode | Structured mode |
|---|---|
| Generates L1/L2/L3 + Task items | Generates Task items only |
| Assigns new L1/L2/L3 IDs (EP-001, FT-001, US-001) | References existing ALM IDs from the spec |
| `work-items.yaml` has 4 levels | `work-items.yaml` has Tasks only; `parent` = existing L3 ALM ID |
| `plan.md` creates L1/L2/L3 headings | `plan.md` uses existing L1/L2/L3 headings from spec §13 |

### Structured plan.md structure

```
## {L1-Type}: {L1-ALM-ID} — {L1 Title}

### {L2-Type}: {L2-ALM-ID} — {L2 Title}

#### {L3-Type}: {L3-ALM-ID} — {L3 Title}

**Mapped FRs:** FR-001, FR-002

**Module Architecture Summary:** {2–3 sentences on which CE extension points will be used and why.}
**Data Flow:** {Source} → {Component} → {Target}

##### Tasks

| Task ID | ALM ID | Title | Component Type | Artefacts | Dependencies | Complexity | Role | Type |
|---|---|---|---|---|---|---|---|---|
| T-001 | *(pending)* | ... | Plugin | ... | — | M | Developer | Dev |
```

### Structured work-items.yaml

Only Level 4 (Task) entries are written. Each task's `parent` field holds the existing L3 ALM ID.

```yaml
work-items:
  - id: "{feature-name}-T-001"
    level: 4
    alm-type: Task
    title: "..."
    parent: "{existing-L3-ALM-ID}"   # e.g., "US-12345" from Azure DevOps
    alm-id: null
    component-type: Plugin
    complexity: M
    status: TODO
    validation-status: NOT VALIDATED
    impl-doc-path: null
    fr-refs:
      - FR-001
```

### Structured plan sections

- **Section 1 — Work Breakdown**: headed by existing L1/L2/L3 IDs and titles from the spec; contains only Task tables
- **Section 2 — Task Inventory**: consolidated task table (no L1/L2/L3 rows)
- **Section 3 — Implementation Sequence**: same as standard (schema → plugin/flow → UX → testing)
- **Section 4 — Dependency Mapping**: task-to-task only; L3-to-L3 references use existing ALM IDs
- **Section 5 — FR → L3 → Task Traceability**: FR-NNN → existing L3 ALM ID → Task ID
- **Section 6 — Constitution Exception Requests**: same as standard
- **Section 7 — Document Control**: note `intake: structured` and source ALM tool

### Structured mode rules

- **Never** emit L1, L2, or L3 entries in `work-items.yaml`
- **Never** assign new EP/FT/US IDs — the ALM tool already holds those
- Every Task's `parent` must be an existing L3 ALM ID from the spec's §13 ALM Traceability Matrix
- All other plan rules apply: unit-test tasks, schema-before-plugin sequencing, FR traceability

---

### L3-Optional Sub-Mode

*Additionally active when `l3-intake: optional` in `constitution/10-alm-configuration.md`
or when the spec front matter contains `l3-intake: optional`.*

In this sub-mode the spec has one or more L2 branches with no ALM-provided L3 items (marked
`source: pending` in the spec's `alm-ids` YAML front matter, and with Source column value `pending`
in the §13 ALM Traceability Matrix). `/plan` identifies pending branches by reading the Source column
in the §13 matrix — rows where Source = `pending` — then generates new L3 User Stories for those
branches and Tasks under all L3s.

#### What changes

| Structured mode (l3-intake: required) | L3-Optional sub-mode |
|---|---|
| All L3 from ALM — Tasks only in YAML | ALM-provided L3 → Tasks only; pending L2 → new L3 entries + Tasks |
| No new L3 IDs assigned | New {L3-Prefix}-NNN IDs assigned for generated stories |
| plan.md headings reference existing ALM IDs | Generated L3 headings marked `⚑ NEW` |

#### Generating L3 items for pending L2 branches

For each L2 whose §13 Traceability Matrix Source column value is `pending`:
1. Read the L2 title and description to understand the functional scope
2. Decompose into User Stories — same logic as standard unstructured mode (As a {persona}, I want {action}, so that {value}). Minimum 1 story per L2, more if the scope warrants it.
3. Assign sequential IDs using the L3 prefix: {L3-Prefix}-001, {L3-Prefix}-002, …
   (continue from the highest existing {L3-Prefix} ID in `work-items.yaml` if it already has entries, otherwise start at 001)
4. Generate Tasks under each new L3 — same rules as standard structured mode Tasks
5. Emit both the L3 entries and their Task entries in `work-items.yaml`

#### L3-optional additions to work-items.yaml

```yaml
# Generated L3 — not from ALM; parent = existing L2 ALM ID
- id: "{feature-name}-{L3-Prefix}-001"
  level: 3
  alm-type: {L3-Type}
  title: "As a {persona}, I want {action}, so that {value}"
  source: generated          # created by /plan — ALM Agent will push this to ADO
  parent: "{L2-ALM-ID}"     # existing ALM L2 ID
  alm-id: null
  story-points: {N}
  acceptance-criteria: |
    - Given {precondition}, When {action}, Then {outcome}
    - Given {precondition}, When {error-action}, Then {error-outcome}
  fr-refs: []
  status: TODO

# Task under a generated L3 — parent is the generated L3 uid
- id: "{feature-name}-T-NNN"
  level: 4
  alm-type: Task
  title: "..."
  source: generated-parent   # parent L3 was generated by /plan, not from ALM
  parent: "{feature-name}-{L3-Prefix}-001"
  alm-id: null
  component-type: Plugin | WebResource | PCF | SchemaChange | Flow | Configuration
  complexity: S | M | L | XL
  status: TODO
  validation-status: NOT VALIDATED
  impl-doc-path: null
  fr-refs: []
```

#### plan.md visual distinction for generated L3

```markdown
#### {L3-Type}: {L3-Prefix}-001 — {Generated Story Title}   ⚑ NEW

> **Source:** Generated by `/plan` — no L3 items were provided for parent {L2-ALM-ID}.
> The ALM Agent (`/wi-create-bulk`) will create this story in the ALM tool.

**Mapped FRs:** {FR-NNN if derivable from L2 scope, otherwise "— (to be assigned after /review)"}
**As a** {persona}, **I want** {action}, **so that** {value}.
**Acceptance Criteria:**
- Given …, When …, Then …
- Given …, When …, Then … (error path)

##### Tasks
| Task ID | ALM ID | Title | Component Type | … |
```

#### L3-optional mode rules

- ALM-provided L3 items (`source: alm`) follow standard structured mode exactly — Tasks only, `parent` = existing ALM ID
- Generated L3 items (`source: generated`) get full L3 entries in `work-items.yaml`; their Tasks reference the generated L3 uid as `parent`
- Never overwrite or replace an ALM-provided L3 with generated content
- If `work-items.yaml` already exists, preserve all existing uid and non-null alm-id values; only append new entries for pending L2 branches
- The ALM Agent (`/wi-create-bulk`) handles mixed output: it creates generated L3s as new User Stories in ADO (parented to the L2 ALM ID) and creates Tasks under all L3s
- All other plan rules apply: unit-test tasks, schema-before-plugin sequencing, FR traceability, constitution exceptions
