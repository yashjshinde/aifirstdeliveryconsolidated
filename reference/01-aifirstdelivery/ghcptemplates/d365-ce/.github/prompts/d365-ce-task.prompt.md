---
mode: agent
description: "Generate development-ready task cards for a D365 CE feature. Use when the user wants task cards generated from a task-ready plan. Triggers on: 'task cards', 'generate tasks', 'create task cards', 'dev tasks'."
---

Generate development-ready task cards from an approved technical plan.

## Pre-condition Check

1. Read `plans/{feature-name}/clarify.md`.
2. If status is `NOT READY`, stop and tell the user to resolve blockers in the clarify report first.
3. If status is `PARTIALLY READY`, warn the user and skip tasks flagged as NOT READY.

## Steps

4. Read all files in `constitution/` including `10-alm-configuration.md` — load ALM type names ({L1-Type}, {L2-Type}, {L3-Type}, {L4-Type}) and ID prefixes.
5. Read `plans/{feature-name}/plan.md` and `specs/{feature-name}/spec.md`.

5b. **Cross-Feature Pre-requisite Check** — read `plans/_component-registry.md` if it exists:
    - Identify any component in `plans/{feature-name}/plan.md`'s Section 4a (Cross-Feature Dependencies) that has overlap type SEQUENTIAL (this feature depends on another feature's component)
    - For each SEQUENTIAL dependency: add a pre-requisite checkbox to every affected task card:
      `- [ ] **Cross-feature dependency:** {component name} must be deployed as part of {other-feature} before this task can be completed`
    - For any CONFLICT overlap: add a warning block at the top of the affected task card:
      `> ⚠ **CONFLICT WARNING:** {component name} is also modified by {other-feature}. Coordinate with that feature team before implementing.`
    - If no SEQUENTIAL or CONFLICT overlaps: proceed without adding extra checkboxes

5c. **Brownfield Check** — check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `true`:
    - Read `specs/{feature-name}/impact-analysis.md` — for each task being generated, retrieve its `brownfield-action`.
    - For tasks with action `EXTEND` or `REPLACE`, read the relevant existing component doc:
      - Plugin: `{brownfield.docs-path}/technical/plugins/{AssemblyName}.md`
      - Web Resource: `{brownfield.docs-path}/technical/web-resources/{namespace}.md`
      - Entity: relevant section in `{brownfield.docs-path}/functional/entity-catalogue.md`
      - Flow: relevant section in `{brownfield.docs-path}/functional/flows.md`
    - For tasks with action `EXTEND` or `REPLACE`, also read the `source-file` path recorded in
      `specs/{feature-name}/impact-analysis.md` for this component:
      - If `source-file` is a valid path: open the file and extract the minimal relevant block:
        - C# Plugin → class declaration + `Execute()` method signature + first 30 lines of method body
        - JS/TS Web Resource → the function(s) registered on this entity/event
        - PCF Control → `init()` and `updateView()` method signatures
        Embed this block in the task card under **Existing System → Existing Code**.
        Add **Existing System → Required Delta**: describe the specific change needed (new method,
        modified condition, added logic) — not a full rewrite instruction.
      - If `source-file: ⚠ NOT FOUND`: write in the task card's **Existing System** section:
        `⚠ Source file not found in input/. Developer must locate the file before starting. Brownfield doc summary: {summary from component doc above}`
    If `false`: skip.

6. For each {L4-Type} task in the plan, generate a task card using `tasks/_template.md`:
   - File: `tasks/{feature-name}/{nn}-{task-slug}.md` where `nn` is a sequential two-digit number
   - Derive `role` and `type` from the task's Role/Type columns in the plan task table
   - Plan Reference: populate L1/L2/L3 parent chain from the plan hierarchy; list related task IDs (depends-on and follow-on)
   - Context: state the story objective (what the parent {L3-Type} delivers) and which story ACs this specific task contributes to
   - Pre-requisites: list specific dependency task IDs (from plan dependency table) + any environment state; each item must be a checkbox
   - D365 CE Specifics: fill only the rows that apply to the component type; remove others
   - Technical Approach: numbered steps specific enough that a developer needs no further questions
   - Validation: 2–4 concise bullet points — what to do and what the exact expected result is (include D365 navigation path, test data, or command to trigger)
7. Write all task cards to `tasks/{feature-name}/`.
8. Print a manifest of all task cards created, grouped by {L3-Type}:

```
TASK CARDS GENERATED — {feature-name}
═══════════════════════════════════════
{L3-Type} {L3-Prefix}-001 — {Story Title}
  01-task-slug.md  ({L4-Prefix}-001)
  02-task-slug.md  ({L4-Prefix}-002)
  03-task-slug.md  ({L4-Prefix}-003)

{L3-Type} {L3-Prefix}-002 — {Story Title}
  04-task-slug.md  ({L4-Prefix}-004)
  05-task-slug.md  ({L4-Prefix}-005)

Total: {N} task cards
Next step: /d365-ce-validate {feature-name}
```

## Each Task Card Must Contain

- **Front matter**: task-id ({L4-Prefix}-NNN), component-type, story-ref ({L3-Prefix}-NNN), fr-refs, role, type, complexity, status, validation-status, output-path, alm-type ({L4-Type}), alm-parent-ref ({L3-Prefix}-NNN), alm-id (null), priority
- **Plan Reference** table — L1/L2/L3 parent chain, related FRs, dependency and follow-on task IDs
- **Context** — story objective (what the parent {L3-Type} delivers) + which story ACs this task contributes to
- **Pre-requisites** — checkboxes: specific dependency task IDs that must be DONE + environment/access state
- **D365 CE Specifics** table — applicable rows only for the component type
- **Technical Approach** — numbered steps; specific enough that a developer needs no further questions
- **Validation** — 2–4 bullet points: what to execute and what to expect to confirm the task works
- **Acceptance Criteria** — AC-001, AC-002, … — numbered, testable, specific
- **Test Cases** — one test case per AC minimum; positive + negative
- **Output Location** — exact path in `output/{feature-name}/src/`
- **Existing System** *(brownfield mode only, for EXTEND or REPLACE tasks)* — brownfield-action, existing component summary (what it currently does), delta description (what specifically this task changes), compatibility constraint (what must not be broken by this change)
- **AI Notes** — one-line blockquote immediately before Definition of Done: key implementation decision made, approach alternative rejected and why, or risk specific to this task. Format: `> **AI Notes** — {1–2 sentences}`
- **Definition of Done** — checklist the developer signs off before marking DONE

## Rules

- Task cards are developer-ready: a developer must be able to implement without asking questions.
- Each task card is self-contained — do not refer to "see previous task" for context.
- Every acceptance criterion must be independently verifiable.
- Pre-requisites must cite specific task IDs or measurable system state — not vague statements.
- Validation steps must be executable: include navigation paths, test data, or commands.
- Never skip tasks flagged as PARTIALLY READY — include them with a `[PARTIALLY READY — see clarify.md]` note in the Context section.
- Every task card must include an AI Notes callout immediately before the Definition of Done.
