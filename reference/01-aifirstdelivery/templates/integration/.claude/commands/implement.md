Implement a development-ready task card for Azure Integration, generate a task-level implementation record, and update the feature implementation tracker.

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
      - Azure Function: `{brownfield.docs-path}/integrations/azure-functions/{FunctionApp}.md` — note trigger bindings, Managed Identity usage, retry policy, logging correlation patterns
      - Logic App: `{brownfield.docs-path}/integrations/logic-apps/{WorkflowName}.md` — note trigger type, connection references, parameter naming, run-after patterns
      - Service Bus / Schema (EXTEND): `{brownfield.docs-path}/component-inventory.md` — note existing schema version to ensure new version is backwards-compatible
    - For `EXTEND`: generated code and IaC must not modify existing trigger bindings, connection references, or message schemas in a breaking way.
    - For `REPLACE`: document explicitly what is being removed or rebuilt in the Deviations section of the implementation record.
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

#### Path A — Function
- Scaffold: C# isolated worker function, trigger attribute binding (ServiceBusTrigger / HttpTrigger / TimerTrigger), `ILogger<T>` structured logging with correlationId on every log statement, try/catch with RFC 7807 error shape on HTTP triggers, Managed Identity client for downstream calls, Polly retry policy as specified in the task card
- Take trigger binding, identity, RBAC role, retry policy, and timeout from the task card's Azure Specifics table
- Test: xUnit test class with mocked `ILogger` and service dependencies; happy path, retry exhaustion, and DLQ-trigger scenarios
- Write all files to the exact `output-path` in the task card front matter

#### Path B — LogicApp
- Scaffold: `workflow.json` with trigger definition, all actions renamed to descriptive labels, an outer error-handling scope wrapping main actions, Configure run after set on error branches, retry policy on every connector action
- Parameter file: `parameters.json` with placeholders for environment-specific connection strings and identities
- Companion doc: `workflow-description.md` explaining each action and decision branch in plain language
- Write to `output-path`

#### Path C — ServiceBus
- Generate JSON Schema file at `output/{feature}/src/Schemas/{MessageName}.schema.json`
- Schema must include: `messageId` (guid), `correlationId` (guid), `source`, `eventType` (domain.entity.action format), `timestamp` (ISO 8601), `schemaVersion`, and `payload` object
- Generate matching C# DTO class at `output/{feature}/src/Schemas/{MessageName}Dto.cs`
- Write to `output-path`

#### Path D — APIM
- Generate policy XML with: inbound JWT validation or subscription key check, rate limit policy, `set-header` to inject correlation ID, outbound error normalisation to RFC 7807 format
- Generate or update `openapi.yaml` with operation definition
- Write to `output-path`

#### Path E — Bicep
- Scaffold: module file with resource definitions, naming derived from `constitution/01-integration-patterns.md` conventions, role assignments for Managed Identity on every resource that needs access, outputs block for resource IDs and connection strings
- Parameter file with `@secure()` on all secret parameters and `@description()` on all parameters
- Write to `output/{feature-name}/infrastructure/`

#### Path F — Schema
- Generate JSON Schema and matching C# DTO (same as ServiceBus path above)
- Write to `output-path`

#### Path G — Configuration
- Work through each step in the task card's Technical Approach section in order
- For each step: execute it where automatable (generate config files, write parameter values) or document it precisely where manual action is required in the Azure portal, Key Vault, or Azure DevOps
- Record every resource name, setting name, location, and value applied
- Flag every step that requires a human to act with `[MANUAL]` and provide exact portal navigation path or CLI command
- No code is compiled — the deliverable is documented configuration evidence

### 4. Verify

- Confirm all acceptance criteria in the task card can be checked off based on what was produced
- Confirm all Definition of Done items are met
- Confirm no constitution rule is violated (no hardcoded connection strings, Managed Identity used, naming conventions correct)

### 5. Generate implementation record

10. Create `output/{feature-name}/impl-docs/{task-id}-{task-slug}-impl.md`:
    - Use `doc-templates/impl-doc-template.md` as the structure
    - Fill in all sections appropriate to the component type:
      - **Code tasks** (Function/LogicApp/APIM/ServiceBus/Bicep): Files Created table, Tests Created table, Build Status checklist
      - **Schema tasks**: list schema file and DTO in Files Created; no build status checklist
      - **Configuration tasks**: Configuration Steps Completed table, Settings Applied table; omit Files Created and Build Status
    - Deviations section: note anything that differed from the task card; write *(none)* if fully aligned
    - Manual Steps Required: list any steps the developer or ops must still complete manually; write *(none)* if fully automated
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

All generated files go to `output/{feature-name}/src/` or `output/{feature-name}/infrastructure/` (code/IaC) and `output/{feature-name}/impl-docs/` (records) as defined in the task card.
Never write outside these paths without explicit user instruction.
