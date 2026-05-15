---
mode: agent
description: "Implement a Power Platform task card — generate Power Fx formulas, Flow JSON, Copilot YAML. Triggers on: 'implement', 'generate code'."
---

Implement a development-ready task card for Power Platform, generate a task-level implementation record, and update the feature implementation tracker.

## Pre-condition Check (GATE)

1. Identify the task card to implement. If not specified, ask the user which task card to use.
2. Read the task card front matter and check `validation-status`.
3. If `validation-status` is not `READY TO IMPLEMENT`, stop immediately:
   - If `NEEDS REWORK`: "This task has not passed validation. Run `/power-apps-validate {feature-name}` first and fix all reported issues."
   - If `BLOCKED`: "This task is blocked by an incomplete dependency. Check the validation report and complete blocking tasks first."
   - If field is missing: "This task has not been validated. Run `/power-apps-validate {feature-name}` before implementing."

## Steps

### 1. Load context

4. Read all files in `constitution/` — all output must comply.
5. Read the full task card: `tasks/{feature-name}/{task-card}.md`
6. Read the related spec: `specs/{feature-name}/spec.md` for business context.
7. Note the `component-type` field — it controls which implementation path to follow.

6b. If `brownfield.enabled: true` in `constitution/10-alm-configuration.md` and the task card has
    `brownfield-action: EXTEND` or `brownfield-action: REPLACE`:
    Read the existing component doc from the brownfield baseline before generating output:
    - Canvas App: note existing screen naming convention (e.g., `scr{Purpose}`), named formula patterns, variable prefixes (`gbl_`/`loc_`/`tp_`), connection reference names
    - Power Automate Flow: note trigger type, existing connection references, error handling scope patterns, child flow naming
    - Dataverse Table: note existing column schema names, option set names, delegation-safe column types used for filters
    - Model-Driven App: note existing tab/section/field names, Business Rule naming, view naming conventions
    - Copilot Studio: note existing topic naming, variable naming (`gbl_`), entity names, escalation action names
    EXTEND must not rename existing screens, columns, flows, topics, or connection references.
    REPLACE must document what was removed in the implementation record.

### 2. Mark task as started

8. Update the task card front matter: set `status: IN PROGRESS`.
9. Create or update `tasks/{feature-name}/tracker.md`:
   - If the tracker does not exist, create it using `tasks/_tracker-template.md` as the structure.
   - Scan all `*.md` files in `tasks/{feature-name}/` (excluding `tracker.md` and `_*.md`) to populate or refresh the full task list from their front matter.
   - Update this task's row: Status = `IN PROGRESS`.
   - Recalculate summary counts (Total, Done, In Progress, TODO, Blocked).
   - Append a row to the Implementation Log: `{today} | {task-id} | {title} | Status → IN PROGRESS`

### 3. Implement the task

Check `type` first — if `type: Testing`, follow Path H regardless of `component-type`.
Otherwise check `component-type` and follow the matching path:

#### Path A — CanvasApp
- Generate Power Fx formulas for each screen named in the task card, in annotated YAML export format
- Every `ClearCollect()`, `Set()`, and `UpdateContext()` must have a comment explaining its purpose
- Every formula that is not delegation-safe must include a `// DELEGATION WARNING: {reason}` comment
- Named formulas go in a dedicated `_formulas` section at the top of the YAML
- Variables follow `gbl_` prefix (global) or context variable names match `locVar{Purpose}`
- Write to `output-path`

#### Path B — Flow
- Generate flow definition as documented JSON export compatible with `pac flow import`
- Every action must have a descriptive Display Name (not the default "Send an email")
- Include an error-handling scope wrapping the main actions with Configure run after set for failure/timeout
- Connection references: use named references (not direct connections) — list each connection reference name required
- Child flow calls: document input/output parameters
- Write to `output-path`

#### Path C — CopilotTopic
- Generate topic definition as structured YAML compatible with Copilot Studio import format
- Include: topic name, trigger phrases (minimum 5), all question nodes with entity/option types, all branching conditions, all actions called (Power Automate flows, connectors), all variables with `gbl_` or `tp_` prefix
- Every topic that can reach a dead end must have an escalation path to a human agent
- Write to `output-path`

#### Path D — ModelDrivenApp
- Generate `schema-change.md` for any new tables, columns, views, or forms
- For Business Rules: generate a structured description with exact conditions (field, operator, value) and actions (set field, set visibility, set required)
- For views: generate column list with schema names, filter conditions, and sort order
- Write to `output-path`

#### Path E — DataverseSchema
- Generate `schema-change.md` at `output-path` describing every table, column, relationship, and option set to create
- Include: schema name (with publisher prefix), display name, data type, required/optional, description, delegation-safe note for choice/lookup/text columns
- No artifact is imported automatically — this is an instruction document for the maker

#### Path F — SecurityRole
- Generate a security role specification document at `output-path` describing: role name, table-level privileges (Create/Read/Write/Delete/Append/AppendTo/Assign/Share) with scope (User/Business Unit/Parent/Organisation), field security profiles required
- If the task involves Azure AD group sharing, document the group name and access level
- Write to `output-path`

#### Path G — Configuration
- Work through each step in the task card's Technical Approach section in order
- For each step: execute it where automatable (generate YAML, JSON, environment variable specs) or document it precisely where manual action is required in Maker Portal, Admin Center, or Copilot Studio
- Record every setting name, location (portal path), and value that was applied
- Flag every step that requires a human to act with `[MANUAL]` and provide exact portal navigation path
- Note connection references that must be manually wired up after solution import
- No artifact is compiled — the deliverable is documented configuration evidence

#### Path H — Testing *(type: Testing, role: QA)*

Detect which component is being tested from the task title (e.g., "Test Studio tests for {L4-Prefix}-NNN — {screen name}" or "Flow tests for {L4-Prefix}-NNN — {Flow name}") and generate the appropriate test script:

**Canvas App test tasks** — generate `output/{feature-name}/src/Tests/{task-id}-test-script.md`:
- **Test Suite Name**: `{ScreenOrComponent}TestSuite` — matches the Test Studio suite to create
- **Pre-conditions**: environment state, test data records required, user context (role/security)
- **Test Cases table**: one row per AC from the paired implementation task; columns: TC-ID | AC-Ref | Test Name | Steps | Expected Result | Pass Criteria
  - Include at least one delegation boundary test if the screen uses Filter/Sort on large tables
  - Include at least one negative test (invalid input, missing required field, permission denied)
- **Test Studio Setup**: step-by-step instructions to create the suite in Power Apps Studio → Test → New suite, add each test case, and configure the expected formula assertions (`Assert(condition, "message")`)
- **pac test run command**: `pac test run --environment {env-id} --test-plan-file {path}` — include the exact command for CI execution if the solution uses automated pipelines
- **Evidence**: describe what screenshots or run-history exports to capture as evidence before marking DONE

**Flow test tasks** — generate `output/{feature-name}/src/Tests/{task-id}-test-script.md`:
- **Pre-conditions**: test data records, environment, connection references wired, run-as identity configured
- **Test Cases table**: one row per AC from the paired flow task; columns: TC-ID | AC-Ref | Description | Trigger Method | Input Data | Expected Outcome | Verified Via
  - Include the happy-path trigger (manual trigger, test record creation, or scheduled run)
  - Include the error-path trigger (missing required field, downstream failure simulation)
  - Include a rerun/idempotency test where applicable
- **Trigger instructions**: exact navigation path to run the flow manually — *Power Automate → My flows → {Flow Name} → Run* — or the pac CLI command if HTTP-triggered
- **Verification**: where to check run history (*Power Automate → My flows → {Flow Name} → Run history*), what the run status and output should show, and which Dataverse records to inspect
- **Evidence**: run history screenshot, output values, and any Dataverse record changes to capture before marking DONE

### 4. Verify

- Confirm all acceptance criteria in the task card can be checked off based on what was produced
- Confirm all Definition of Done items are met
- Confirm no constitution rule is violated (publisher prefix on schema names, delegation-safe columns used in filters, connection references named — not direct connections)

### 5. Generate implementation record

10. Create `output/{feature-name}/impl-docs/{task-id}-{task-slug}-impl.md`:
    - Use `doc-templates/impl-doc-template.md` as the structure
    - Fill in all sections appropriate to the component type:
      - **Artifact tasks** (CanvasApp/Flow/CopilotTopic/ModelDrivenApp): Artifacts Created table, Power Platform Specifics table (delegation, connection references, DLP impact)
      - **DataverseSchema / SecurityRole tasks**: list the generated description file in Artifacts Created; no Power Platform Specifics needed
      - **Configuration tasks**: Configuration Steps Completed table, Settings Applied table; omit Artifacts Created and Power Platform Specifics
      - **Testing tasks** (type: Testing): Test Script Created table (path to generated test-script.md), Test Cases count, Evidence Required checklist
    - Deviations section: note anything that differed from the task card; write *(none)* if fully aligned
    - Manual Steps Required: list steps the maker or admin must still complete; write *(none)* if fully automated
    - AC Sign-off: PASS / FAIL / PARTIAL for each AC from the task card
11. Update the task card front matter: set `impl-doc-path: output/{feature-name}/impl-docs/{task-id}-{task-slug}-impl.md`

### 6. Mark task as done and update tracker

12. Update the task card front matter: set `status: DONE`.
13. Update `tasks/{feature-name}/tracker.md`:
    - Update this task's row: Status = `DONE`, Impl Doc = link to the impl doc
    - Recalculate summary counts and completion percentage
    - Append a row to the Implementation Log: `{today} | {task-id} | {title} | Status → DONE`

### 7. Print completion summary

Print:
```
IMPLEMENTATION COMPLETE — {task-id}: {task-title}
══════════════════════════════════════════════════
Component type : {component-type}
Files created  : {list of file paths}
Delegation safe: Yes / No — {detail if No}
Impl doc       : output/{feature}/impl-docs/{task-id}-{slug}-impl.md
Tracker        : tasks/{feature}/tracker.md updated ({done} of {total} tasks done)

Manual steps required:
  {numbered list, or "None — all steps automated"}
```

## Output Location

All generated files go to `output/{feature-name}/src/` (artifacts) and `output/{feature-name}/impl-docs/` (records) as defined in the task card.
Never write outside these paths without explicit user instruction.
