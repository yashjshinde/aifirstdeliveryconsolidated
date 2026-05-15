---
mode: agent
description: "Analyse an approved Power Apps feature spec against the existing brownfield system and classify every component as NEW, EXTEND, REPLACE, REFERENCED, or CONFLICT. Triggers on: 'impact', 'impact analysis', 'brownfield impact'."
---

# /power-apps-impact — Brownfield Impact Analysis

Analyse an approved feature spec against the existing brownfield Power Platform system.
Classifies every component the feature touches as NEW, EXTEND, REPLACE, REFERENCED, or CONFLICT.
Required by `/power-apps-plan` when `brownfield.enabled: true`.

## Usage

```
/power-apps-impact {feature-name}
```

## Pre-condition Check

1. Read `constitution/10-alm-configuration.md` — check `brownfield.enabled`.
   If `false`, stop: "Brownfield mode is not enabled. Set `brownfield.enabled: true` in `constitution/10-alm-configuration.md` to use this command."

2. Read `specs/{feature-name}/review.md`.
   If status is not `APPROVED`, stop: "Spec is not approved. Run `/power-apps-review {feature-name}` first."

3. Read `{brownfield.docs-path}/component-inventory.md`.
   If it does not exist, stop: "Brownfield docs not found at `{brownfield.docs-path}`. Run the brownfield agent's `/scan` command first."

## Steps

4. Read all available brownfield documentation:
   - `{brownfield.docs-path}/component-inventory.md` — full component list with source packages
   - `{brownfield.docs-path}/functional/entity-catalogue.md` (if exists) — existing Dataverse tables and columns
   - `{brownfield.docs-path}/functional/flows.md` (if exists) — existing Power Automate flows
   - `{brownfield.docs-path}/technical/technical-overview.md` (if exists)
   - `{brownfield.docs-path}/architecture/dependency-map.md` (if exists)

5. Read `specs/{feature-name}/spec.md` — focus on:
   - §5 Functional Requirements: "Component" row for each FR
   - §6 Power Platform Impact Summary table
   - §15 Brownfield Context if already populated by `/power-apps-spec`

6. For every component referenced in the spec, look it up in the brownfield inventory and classify:

   | Action | Meaning |
   |---|---|
   | `NEW` | Does not exist — must be created from scratch |
   | `EXTEND` | Exists; new capability added (new screen, new flow branch, new topic, new column, new view) |
   | `REPLACE` | Exists; logic substantially rewritten or removed and rebuilt |
   | `REFERENCED` | Exists and consumed by this feature but its own definition does not change |
   | `CONFLICT` | Exists but the spec's intent contradicts the current documented behaviour |

7. For every `EXTEND`, `REPLACE`, or `CONFLICT` component, read its detailed brownfield doc:
   - Canvas App / Model-Driven App: relevant section in `{brownfield.docs-path}/functional/`
   - Power Automate Flow: `{brownfield.docs-path}/functional/flows.md` — named flow section
   - Copilot Studio: relevant section in `{brownfield.docs-path}/functional/`
   - Dataverse Table: relevant section in `{brownfield.docs-path}/functional/entity-catalogue.md`

7b. **Source File Resolution** — for every `EXTEND`, `REPLACE`, or `CONFLICT` component from Step 7, locate the actual source file in `input/` using these lookup patterns:

   | Component Type | Lookup Pattern |
   |---|---|
   | Canvas App (unpacked) | `input/src/**/*{AppName}*/` |
   | Power Automate Flow | `input/solutions/**/Workflows/*{FlowName}*.json` |
   | Model-Driven App | `input/solutions/**/AppModules/*{AppName}*` |
   | Copilot Studio (exported) | `input/src/**/*{AgentName}*/` |

   For each component:
   - If file **found**: record `source-file: {relative-path}` alongside that component's row in `impact-analysis.md`.
   - If file **not found**: record `source-file: ⚠ NOT FOUND` and add an entry to the **Open Questions** section:
     "`{Component}` is classified as `{Action}` in the brownfield docs but no source file was found in `input/`. Confirm whether `/prepare` was run completely or whether the brownfield docs are stale before planning begins."

8. Using `{brownfield.docs-path}/architecture/dependency-map.md`, identify cascading dependencies:
   for each component being modified, find what else depends on it and assess the blast radius.
   Pay special attention to Canvas Apps that read tables being extended, and flows triggered by tables being modified.

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

### Dataverse Tables / Columns

| Schema Name | Brownfield Status | Action | Change Description | Risk |
|---|---|---|---|---|
| {schema} | EXISTS ({package}) | EXTEND | Add {N} columns; delegation impact assessed | Low |
| {schema} | NOT FOUND | NEW | Create per FR-{NNN} | — |

### Canvas Apps

| App Name | Screens Affected | Action | Change Description | Risk | Source File |
|---|---|---|---|---|---|
| {app} | {screens} | EXTEND | Add {screen-name} screen for FR-{NNN} | Low | `input/src/{AppName}/` |
| {app} | — | NEW | Create per FR-{NNN} | — | — |

### Model-Driven Apps

| App Name | Forms / Views Affected | Action | Change Description | Risk |
|---|---|---|---|---|
| {app} | {form} | EXTEND | Add {field} to {form} for FR-{NNN} | Low |

### Power Automate Flows

| Flow Name | Trigger | Action | Change Description | Risk | Source File |
|---|---|---|---|---|---|
| {flow} | {trigger} | EXTEND | Add approval branch for FR-{NNN} | Medium | `input/solutions/.../Workflows/{flow}.json` |
| {flow} | — | NEW | Create per FR-{NNN} | — | — |

### Copilot Studio Topics / Agents

| Agent Name | Topics Affected | Action | Change Description | Risk |
|---|---|---|---|---|
| {agent} | {topic} | EXTEND | Add {trigger-phrase} route for FR-{NNN} | Low |
| {agent} | — | NEW | Create per FR-{NNN} | — |

### Security Roles

| Role Name | Action | Change Description |
|---|---|---|
| {role} | EXTEND | Add read/write privileges on {table} |

---

## Risk Assessment

### High-Risk Changes

*(REPLACE or CONFLICT components only)*

For each: current usage (how many other apps/flows reference it), blast radius of modification,
delegation impact if a Dataverse table is involved, and recommended regression test scope.

*If none: No high-risk changes identified.*

### Dependency Cascade

| Modified Component | Depended On By | Impact |
|---|---|---|
| {component} | {dependent-1}, {dependent-2} | Re-test after change |

*If none: No cascading dependencies identified.*

### Delegation Risk

For each Dataverse table being extended: are new columns used in Canvas App filters or sorts?
If yes: confirm column type is delegation-safe. Flag any delegation-unsafe additions.

*If none: No delegation risks identified.*

### Recommended Implementation Sequence

1. Dataverse schema changes — unblock Canvas Apps and flows that depend on new columns
2. Security roles — after schema exists, before apps are tested
3. {next block — Canvas App screens, flow branches, Copilot topics}
4. Connection references — after all components exist

---

## Conflicts

For each CONFLICT: describe the contradiction between the spec's intent and the existing implementation.
Recommend one of: (a) spec amendment, (b) supervised migration, (c) parallel implementation.

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
  Delegation risks   : {N}
  Conflicts          : {N}

Output    : specs/{feature-name}/impact-analysis.md
Next step : /power-apps-plan {feature-name}
```
