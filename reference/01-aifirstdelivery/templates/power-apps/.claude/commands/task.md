Generate development-ready task cards for a Power Platform feature from an approved technical plan.

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

5c. If `brownfield.enabled: true` in `constitution/10-alm-configuration.md`:
    For every task with `brownfield-action: EXTEND` or `brownfield-action: REPLACE`, read the
    relevant brownfield doc before writing the task card:
    - Canvas App: relevant section in `{brownfield.docs-path}/functional/` — note screen names, named formula patterns, variable naming conventions
    - Power Automate Flow: `{brownfield.docs-path}/functional/flows.md` — note existing trigger, connections, error-handling patterns
    - Dataverse Table: `{brownfield.docs-path}/functional/entity-catalogue.md` — note existing columns, key relationships, delegation-relevant column types
    - Model-Driven App: relevant section in `{brownfield.docs-path}/functional/` — note existing form tabs, Business Rule names, view columns
    - Copilot Studio: relevant section in `{brownfield.docs-path}/functional/` — note existing topic names, variable naming, escalation patterns
    Use this to populate the Existing System section of the task card.
    - Also read the `source-file` path recorded in `specs/{feature-name}/impact-analysis.md` for this component:
      - If `source-file` is a valid path: open the file and extract the minimal relevant block:
        - Canvas App → the screen definition file(s) for the affected screens (`.fx.yaml` or equivalent)
        - Power Automate Flow → the trigger definition + first 5 action definitions from the JSON
        - Model-Driven App → the form XML for the affected form
        - Copilot Studio → the topic YAML file(s) for the affected topics
        Embed this block in the task card under **Existing System → Existing Code**.
        Add **Existing System → Required Delta**: describe the specific change needed (new screen,
        new flow branch, new topic trigger phrase) — not a full rewrite instruction.
      - If `source-file: ⚠ NOT FOUND`: write in the task card's **Existing System** section:
        `⚠ Source file not found in input/. Developer must locate the unpacked app/flow source before starting. Brownfield doc summary: {summary from component doc above}`

6. For each {L4-Type} task in the plan, generate a task card using `tasks/_template.md`:
   - File: `tasks/{feature-name}/{nn}-{task-slug}.md` where `nn` is a sequential two-digit number
   - Derive `role` and `type` from the task's Role/Type columns in the plan task table
   - Plan Reference: populate L1/L2/L3 parent chain from the plan hierarchy; list related task IDs (depends-on and follow-on)
   - Context: state the story objective (what the parent {L3-Type} delivers) and which story ACs this specific task contributes to
   - Pre-requisites: list specific dependency task IDs (from plan dependency table) + any environment or solution state; each item must be a checkbox
   - Power Platform Specifics: fill only the rows that apply to the component type; remove others
   - Technical Approach: numbered steps specific enough that a maker/developer needs no further questions
   - Validation: 2–4 concise bullet points — what to do and what the exact expected result is (include Maker Portal navigation path, Test Studio step, or pac CLI command)
7. Write all task cards to `tasks/{feature-name}/`.
8. Print a manifest of all task cards created, grouped by {L3-Type}:

```
TASK CARDS GENERATED — {feature-name}
═══════════════════════════════════════
{L3-Type} {L3-Prefix}-001 — {Story Title}
  01-task-slug.md  ({L4-Prefix}-001)
  02-task-slug.md  ({L4-Prefix}-002)

{L3-Type} {L3-Prefix}-002 — {Story Title}
  03-task-slug.md  ({L4-Prefix}-003)

Total: {N} task cards
Next step: /validate {feature-name}
```

## Each Task Card Must Contain

- **Front matter**: task-id ({L4-Prefix}-NNN), component-type, story-ref ({L3-Prefix}-NNN), fr-refs, role, type, complexity, status, validation-status, output-path, alm-type ({L4-Type}), alm-parent-ref ({L3-Prefix}-NNN), alm-id (null), priority
- **Plan Reference** table — L1/L2/L3 parent chain, related FRs, dependency and follow-on task IDs
- **Context** — story objective (what the parent {L3-Type} delivers) + which story ACs this task contributes to
- **Pre-requisites** — checkboxes: specific dependency task IDs that must be DONE + environment/solution state (solution imported, connection reference created, schema published, etc.)
- **Power Platform Specifics** table — applicable rows only for the component type (screen, table, trigger, connection reference, delegation risk, etc.)
- **Technical Approach** — numbered steps; specific enough that a maker/developer needs no further questions
- **Validation** — 2–4 bullet points: what to execute and what to expect to confirm the task works (include Maker Portal path or Test Studio step)
- **Acceptance Criteria** — AC-001, AC-002, … — numbered, testable, specific
- **Test Cases** — one test case per AC minimum; positive + negative (delegation edge cases, error paths)
- **Output Location** — exact path in `output/{feature-name}/src/`
- **Existing System** *(include only when `brownfield-action` is `EXTEND` or `REPLACE`)*:
  - `brownfield-action`: EXTEND | REPLACE
  - Existing component summary: current state before this task runs (screens, columns, flows, topics already present)
  - Delta description: specifically what is being added or changed — not the full end-state
  - Compatibility constraint: what must not change (existing screen names, existing column types, existing connection references, existing topic trigger phrases used by other flows)
- **AI Notes** — one-line blockquote immediately before Definition of Done: key implementation decision made, approach alternative rejected and why, or risk specific to this task. Format: `> **AI Notes** — {1–2 sentences}`
- **Definition of Done** — checklist the maker/developer signs off before marking DONE

## Rules

- Task cards are developer/maker-ready: a developer must be able to implement without asking questions.
- Each task card is self-contained — do not refer to "see previous task" for context.
- Every acceptance criterion must be independently verifiable.
- Pre-requisites must cite specific task IDs or measurable solution state — not vague statements.
- Validation steps must be executable: include Maker Portal navigation paths, pac CLI commands, or Test Studio steps.
- Never skip tasks flagged as PARTIALLY READY — include them with a `[PARTIALLY READY — see clarify.md]` note in the Context section.
- DataverseSchema tasks must appear before Canvas App, Flow, or Copilot tasks in the manifest ordering.
- Canvas App tasks with delegation risks must include the delegation mitigation in the Technical Approach — "accept the limit" is not acceptable.
- Every task card must include an AI Notes callout immediately before the Definition of Done.
