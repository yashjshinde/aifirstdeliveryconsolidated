# /impact — Brownfield Impact Analysis

Analyse an approved feature spec against the existing brownfield system.
Classifies every component the feature touches as NEW, EXTEND, REPLACE, REFERENCED, or CONFLICT.
Required by `/plan` when `brownfield.enabled: true`.

## Usage

```
/impact {feature-name}
```

## Pre-condition Check

1. Read `constitution/10-alm-configuration.md` — check `brownfield.enabled`.
   If `false`, stop: "Brownfield mode is not enabled. Set `brownfield.enabled: true` in `constitution/10-alm-configuration.md` to use this command."

2. Read `specs/{feature-name}/review.md`.
   If status is not `APPROVED`, stop: "Spec is not approved. Run `/review {feature-name}` first."

3. Read `{brownfield.docs-path}/component-inventory.md`.
   If it does not exist, stop: "Brownfield docs not found at `{brownfield.docs-path}`. Run the brownfield agent's `/scan` command first."

## Steps

4. Read all available brownfield documentation:
   - `{brownfield.docs-path}/component-inventory.md` — full component list with source packages
   - `{brownfield.docs-path}/functional/entity-catalogue.md` (if exists)
   - `{brownfield.docs-path}/functional/flows.md` (if exists)
   - `{brownfield.docs-path}/technical/technical-overview.md` (if exists)
   - `{brownfield.docs-path}/architecture/dependency-map.md` (if exists)

5. Read `specs/{feature-name}/spec.md` — focus on:
   - §5 Functional Requirements: "D365 CE Impact" row for each FR
   - §6 D365 CE Impact Summary table
   - §14 Brownfield Context if already populated by `/spec`

6. For every component referenced in the spec, look it up in the brownfield inventory and classify:

   | Action | Meaning |
   |---|---|
   | `NEW` | Does not exist — must be created from scratch |
   | `EXTEND` | Exists; new capability added (new plugin step, new column, new form field, new flow branch) |
   | `REPLACE` | Exists; logic substantially rewritten or removed and rebuilt |
   | `REFERENCED` | Exists and consumed by this feature but its own definition does not change |
   | `CONFLICT` | Exists but the spec's intent contradicts the current documented behaviour |

7. For every `EXTEND`, `REPLACE`, or `CONFLICT` component, read its detailed brownfield doc:
   - Plugin: `{brownfield.docs-path}/technical/plugins/{AssemblyName}.md`
   - Web Resource: `{brownfield.docs-path}/technical/web-resources/{namespace}.md`
   - Entity: relevant section in `{brownfield.docs-path}/functional/entity-catalogue.md`
   - Flow: relevant section in `{brownfield.docs-path}/functional/flows.md`

7b. **Source File Resolution** — for every `EXTEND`, `REPLACE`, or `CONFLICT` component from Step 7, locate the actual source file in `input/` using these lookup patterns:

   | Component Type | Lookup Pattern |
   |---|---|
   | Plugin | `input/src/plugins/**/*{ClassName}*.cs` |
   | Web Resource (JS/TS) | `input/src/web-resources/**/*{namespace}*.(js\|ts)` |
   | PCF Control | `input/src/pcf/{ControlName}/` |

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

### Entities / Tables

| Schema Name | Brownfield Status | Action | Change Description | Risk |
|---|---|---|---|---|
| {schema} | EXISTS ({package}) | EXTEND | Add {N} columns; update {form} layout | Low |
| {schema} | NOT FOUND | NEW | Create per FR-{NNN} | — |

### Plugins

| Assembly | Class | Existing Steps | Action | Change Description | Risk | Source File |
|---|---|---|---|---|---|---|
| {assembly} | {class} | {entity}/{msg}/{stage} × N | EXTEND | Add PreValidation step for FR-{NNN} | Medium | `input/src/plugins/.../{Class}.cs` |

### Power Automate Flows

| Flow Name | Trigger | Action | Change Description | Risk |
|---|---|---|---|---|
| {flow} | {trigger} | EXTEND | Add approval branch for FR-{NNN} | Low |

### JavaScript Web Resources

| Schema Name | File | Forms Registered | Action | Change Description | Risk | Source File |
|---|---|---|---|---|---|---|
| {schema} | {file} | {form} | EXTEND | Add {function} handler for FR-{NNN} | Low | `input/src/web-resources/.../{file}` |

### PCF Controls

| Control Name | Action | Change Description | Risk | Source File |
|---|---|---|---|---|
| {control} | NEW / EXTEND / REPLACE | {description} | Low | `input/src/pcf/{ControlName}/` or `⚠ NOT FOUND` |

### Security Roles

| Role Name | Action | Change Description |
|---|---|---|
| {role} | EXTEND | Add read/write privileges on {entity} |

---

## Risk Assessment

### High-Risk Changes

*(REPLACE or CONFLICT components only)*

For each: current usage (how many other components reference it), blast radius of modification,
and recommended regression test scope.

*If none: No high-risk changes identified.*

### Dependency Cascade

| Modified Component | Depended On By | Impact |
|---|---|---|
| {component} | {dependent-1}, {dependent-2} | Re-test after change |

*If none: No cascading dependencies identified.*

### Recommended Implementation Sequence

1. Schema changes — unblock plugins and flows that depend on new columns
2. {next block — plugin steps, flow updates, etc.}
3. Security role updates — after all components exist

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
  Conflicts          : {N}

Output    : specs/{feature-name}/impact-analysis.md
Next step : /plan {feature-name}
```
