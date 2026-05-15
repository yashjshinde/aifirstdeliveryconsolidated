Implement a development-ready task card for D365 CE, generate a task-level implementation record, and update the feature implementation tracker.

## Pre-condition Check (GATE)

1. Identify the task card to implement. If not specified, ask the user which task card to use.
2. Read the task card front matter and check `validation-status`.
3. If `validation-status` is not `READY TO IMPLEMENT`, stop immediately:
   - If `NEEDS REWORK`: "This task has not passed validation. Run `/validate {feature-name}` first and fix all reported issues."
   - If `BLOCKED`: "This task is blocked by an incomplete dependency. Check the validation report and complete blocking tasks first."
   - If field is missing: "This task has not been validated. Run `/validate {feature-name}` before implementing."

## Steps

### 1. Load context

4. Read all files in `constitution/` — all output must comply.
5. Read the full task card: `tasks/{feature-name}/{task-card}.md`
6. Read the related spec: `specs/{feature-name}/spec.md` for business context.

6b. **Brownfield Check** — check `brownfield.enabled` in `constitution/10-alm-configuration.md`.
    If `true` and the task card's `brownfield-action` is `EXTEND` or `REPLACE`:
    - Read the existing component's brownfield doc before generating any code:
      - Plugin: `{brownfield.docs-path}/technical/plugins/{AssemblyName}.md` — note namespace, existing class structure, tracing patterns, error message conventions
      - Web Resource: `{brownfield.docs-path}/technical/web-resources/{namespace}.md` — note namespace pattern, function naming convention, Xrm API version in use
      - Entity (SchemaChange path): `{brownfield.docs-path}/functional/entity-catalogue.md` — note existing columns to avoid name collisions
      - Flow: `{brownfield.docs-path}/functional/flows.md` — note existing trigger, connection references, and error handling patterns
    - For `EXTEND`: generated code must not modify existing method signatures or remove existing functionality.
    - For `REPLACE`: document explicitly what is being removed in the Deviations section of the implementation record.
    If `false` or `brownfield-action` is `NEW`: skip.

7. Note the `component-type` field — it controls which implementation path to follow.

### 2. Mark task as started

8. Update the task card front matter: set `status: IN PROGRESS`.
9. Create or update `tasks/{feature-name}/tracker.md`:
   - If the tracker does not exist, create it using `tasks/_tracker-template.md` as the structure.
   - Scan all `*.md` files in `tasks/{feature-name}/` (excluding `tracker.md` and `_*.md`) to populate or refresh the full task list from their front matter.
   - Update this task's row: Status = `IN PROGRESS`.
   - Recalculate summary counts (Total, Done, In Progress, TODO, Blocked).
   - Append a row to the Implementation Log: `{today} | {task-id} | {title} | Status → IN PROGRESS`

### 3. Implement the task

Check `component-type` and follow the matching path:

#### Path A — Plugin
- Scaffold: C# class implementing `IPlugin`, `Execute` method, tracing service, early-bound entity types, null guards on context inputs
- Registration details (entity, message, stage, rank, filtering attributes) taken directly from the task card's D365 CE Specifics table
- Error handling: catch and log exceptions; re-throw as `InvalidPluginExecutionException` for user-facing errors
- Test: FakeXrmEasy test class with happy path, validation failure, and edge case test methods
- Write all files to the exact `output-path` in the task card front matter

#### Path B — JavaScript Web Resource
- Scaffold: IIFE namespace wrapper, `executionContext` parameter on all handlers, null checks before Xrm API calls, async/await for network operations
- Event handler names taken directly from the task card
- Test: Jest test file with Xrm mock, one test per acceptance criterion
- Write to `output-path`

#### Path C — PCF Control
- Scaffold: TypeScript class, `ControlManifest.Input.xml`, full lifecycle (`init`, `updateView`, `getOutputs`, `destroy`)
- Test: Jest test file with mocked `ComponentFramework.Context`
- Write to `output-path`

#### Path D — SchemaChange
- Generate `schema-change.md` at `output-path` describing every table, column, relationship, and option set to create
- Include: schema name, display name, data type, required/optional, description, lookup target (if any)
- No code is generated — this is an instruction document for the administrator

#### Path E — Flow
- Generate the flow definition JSON with trigger, all actions renamed descriptively, error handling scope wrapping main actions, Configure run after set on error branches
- Document required connection references
- Write to `output-path`

#### Path F — Configuration
- Work through each step in the task card's Technical Approach section in order
- For each step: execute it where automatable (generate files, write config values) or document it precisely where manual action is required
- Record every setting name, location, and value that was applied
- Flag every step that requires a human to act with `[MANUAL]` and provide exact instructions
- No code is compiled — the deliverable is documented configuration evidence

### 4. Verify

- Confirm all acceptance criteria in the task card can be checked off based on what was produced
- Confirm all Definition of Done items are met
- Confirm no constitution rule is violated (naming, structure, forbidden patterns)

### 5. Generate implementation record

10. Create `output/{feature-name}/impl-docs/{task-id}-{task-slug}-impl.md`:
    - Use `doc-templates/impl-doc-template.md` as the structure
    - Fill in all sections appropriate to the component type:
      - **Code tasks** (Plugin/JS/PCF/Flow): Files Created table, Tests Created table, Build Status checklist
      - **SchemaChange tasks**: list every table/column created in the Files Created table; no build status
      - **Configuration tasks**: Configuration Steps Completed table, Settings Applied table; omit Files Created and Build Status
    - Deviations section: note anything that differed from the task card; write *(none)* if fully aligned
    - Manual Steps Required: list any steps the developer must still complete; write *(none)* if fully automated
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
Tests created  : {list of test file paths, or "—" if none}
Impl doc       : output/{feature}/impl-docs/{task-id}-{slug}-impl.md
Tracker        : tasks/{feature}/tracker.md updated ({done} of {total} tasks done)

Manual steps required:
  {numbered list, or "None — all steps automated"}
```

## Output Location

All generated files go to `output/{feature-name}/src/` (code) or `output/{feature-name}/impl-docs/` (records) as defined in the task card.
Never write outside these paths without explicit user instruction.
