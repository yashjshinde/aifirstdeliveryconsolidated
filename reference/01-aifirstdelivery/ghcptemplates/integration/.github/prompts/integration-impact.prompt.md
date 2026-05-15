---
mode: agent
description: "Analyse brownfield impact of an integration spec. Triggers on: 'impact', 'impact analysis', 'brownfield impact'."
---

# /integration-impact — Brownfield Impact Analysis

Analyse an approved feature spec against the existing brownfield system.
Classifies every component the feature touches as NEW, EXTEND, REPLACE, REFERENCED, or CONFLICT.
Required by `/integration-plan` when `brownfield.enabled: true`.

## Usage

```
/integration-impact {feature-name}
```

## Pre-condition Check

1. Read `constitution/10-alm-configuration.md` — check `brownfield.enabled`.
   If `false`, stop: "Brownfield mode is not enabled. Set `brownfield.enabled: true` in `constitution/10-alm-configuration.md` to use this command."

2. Read `specs/{feature-name}/review.md`.
   If status is not `APPROVED`, stop: "Spec is not approved. Run `/integration-review {feature-name}` first."

3. Read `{brownfield.docs-path}/component-inventory.md`.
   If it does not exist, stop: "Brownfield docs not found at `{brownfield.docs-path}`. Run the brownfield agent's `/scan` command first."

## Steps

4. Read all available brownfield documentation:
   - `{brownfield.docs-path}/component-inventory.md` — full component list with source packages
   - `{brownfield.docs-path}/integrations/integration-topology.md` (if exists)
   - `{brownfield.docs-path}/integrations/azure-functions/` — all function app docs (if exist)
   - `{brownfield.docs-path}/integrations/logic-apps/` — all Logic App docs (if exist)
   - `{brownfield.docs-path}/technical/technical-overview.md` (if exists)
   - `{brownfield.docs-path}/architecture/dependency-map.md` (if exists)

5. Read `specs/{feature-name}/spec.md` — focus on:
   - §5 Functional Requirements: "Integration Impact" row for each FR
   - §6 Integration Impact Summary table (systems, components, message schemas)
   - §14 Brownfield Context if already populated by `/integration-spec`

6. For every component referenced in the spec, look it up in the brownfield inventory and classify:

   | Action | Meaning |
   |---|---|
   | `NEW` | Does not exist — must be created from scratch |
   | `EXTEND` | Exists; new capability added (new trigger, new route, new message type, new policy rule) |
   | `REPLACE` | Exists; logic substantially rewritten or removed and rebuilt |
   | `REFERENCED` | Exists and consumed by this feature but its own definition does not change |
   | `CONFLICT` | Exists but the spec's intent contradicts the current documented behaviour |

7. For every `EXTEND`, `REPLACE`, or `CONFLICT` component, read its detailed brownfield doc:
   - Azure Function: `{brownfield.docs-path}/integrations/azure-functions/{FunctionApp}.md`
   - Logic App: `{brownfield.docs-path}/integrations/logic-apps/{WorkflowName}.md`
   - Integration topology / external system: `{brownfield.docs-path}/integrations/integration-topology.md`

7b. **Source File Resolution** — for every `EXTEND`, `REPLACE`, or `CONFLICT` component from Step 7, locate the actual source file in `input/` using these lookup patterns:

   | Component Type | Lookup Pattern |
   |---|---|
   | Azure Function (C#) | `input/integrations/azure-functions/**/*{FunctionName}*.cs` |
   | Azure Function (JS/TS) | `input/integrations/azure-functions/**/*{FunctionName}*.(js\|ts)` |
   | Logic App | `input/integrations/logic-apps/**/*{WorkflowName}*.json` |

   For each component:
   - If file **found**: record `source-file: {relative-path}` alongside that component's row in `impact-analysis.md`.
   - If file **not found**: record `source-file: ⚠ NOT FOUND` and add an entry to the **Open Questions** section:
     "`{Component}` is classified as `{Action}` in the brownfield docs but no source file was found in `input/`. Confirm whether `/prepare` was run completely or whether the brownfield docs are stale before planning begins."

8. Using `{brownfield.docs-path}/architecture/dependency-map.md`, identify cascading dependencies:
   for each component being modified, find what else depends on it and assess the blast radius.

9. Write `specs/{feature-name}/impact-analysis.md` using the structure below.

10. Print completion report.

## Output Structure

```markdown
---
feature: {feature-name}
status: IMPACT-ASSESSED
date: {date}
brownfield-docs: {docs-path}
---

# Impact Analysis — {Feature Display Name}

## Summary

| Action | Count | Components |
|---|---|---|
| NEW | {N} | {comma-separated list} |
| EXTEND | {N} | {comma-separated list} |
| REPLACE | {N} | {comma-separated list} |
| REFERENCED | {N} | {comma-separated list} |
| CONFLICT | {N} | {comma-separated list} |

---

## Affected Components

### Azure Functions

| Function App | Function Name | Trigger | Action | Change Description | Risk | Source File |
|---|---|---|---|---|---|---|
| {app} | {fn} | {trigger} | EXTEND | Add handler for new message type FR-{NNN} | Medium | `input/integrations/azure-functions/.../{fn}.cs` |
| {app} | {fn} | — | NEW | Create per FR-{NNN} | — | — |

### Logic Apps

| Workflow Name | Trigger | Action | Change Description | Risk | Source File |
|---|---|---|---|---|---|
| {workflow} | {trigger} | EXTEND | Add branch for FR-{NNN} | Low | `input/integrations/logic-apps/.../{workflow}.json` |

### Service Bus Topics / Queues

| Resource Name | Type | Action | Change Description | Risk |
|---|---|---|---|---|
| {topic/queue} | Topic | EXTEND | Add new subscription for FR-{NNN} | Low |
| {topic/queue} | Queue | NEW | Create per FR-{NNN} | — |

### Message Schemas

| Schema Name | Action | Change Description | Risk |
|---|---|---|---|
| {schema} | EXTEND | Add {N} new fields; maintain backwards compatibility | Medium |
| {schema} | NEW | Define per FR-{NNN} | — |

### APIM Policies / APIs

| API / Operation | Action | Change Description | Risk |
|---|---|---|---|
| {api}/{op} | EXTEND | Add new operation for FR-{NNN} | Low |

### External Systems

| System Name | Direction | Action | Change Description |
|---|---|---|---|
| {system} | Inbound | REFERENCED | Existing connection consumed; no contract change |
| {system} | Outbound | EXTEND | New event type sent per FR-{NNN} |

---

## Risk Assessment

### High-Risk Changes

*(REPLACE or CONFLICT components only)*

For each: current usage (consumers, publishers), blast radius of modification,
backwards-compatibility considerations, and recommended regression test scope.

*If none: No high-risk changes identified.*

### Dependency Cascade

| Modified Component | Depended On By | Impact |
|---|---|---|
| {component} | {dependent-1}, {dependent-2} | Re-test after change |

*If none: No cascading dependencies identified.*

### Schema Compatibility

For each modified message schema: is the change backwards-compatible?
If not: describe migration approach (versioning, parallel schemas, consumer notification).

*If none: No schema changes identified.*

### Recommended Implementation Sequence

1. Infrastructure (Bicep) — new Service Bus resources, APIM operations
2. Message schema changes — before producers or consumers are updated
3. {next block — Function updates, Logic App updates}
4. Configuration / connection references — after all resources exist

---

## Conflicts

For each CONFLICT: describe the contradiction between the spec's intent and the existing implementation.
Recommend one of: (a) spec amendment, (b) supervised migration, (c) parallel implementation with versioning.

*If none: No conflicts identified.*

---

## Open Questions

Items where the match between spec components and brownfield inventory was uncertain.
Resolve before planning begins.

*If none: No open questions.*
```

## Completion Report

```
IMPACT ANALYSIS COMPLETE — {feature-name}
══════════════════════════════════════════
Brownfield docs : {docs-path}

Components analysed:
  NEW        : {N}
  EXTEND     : {N}
  REPLACE    : {N}
  REFERENCED : {N}
  CONFLICT   : {N}

Risk summary:
  High-risk changes  : {N}
  Dependency cascades: {N}
  Schema conflicts   : {N}
  Conflicts          : {N}

Output    : specs/{feature-name}/impact-analysis.md
Next step : /integration-plan {feature-name}
```
