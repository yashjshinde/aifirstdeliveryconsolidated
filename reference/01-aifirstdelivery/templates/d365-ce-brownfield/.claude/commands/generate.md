# /generate — Run Full Post-Scan Documentation Pipeline in One Shot

Run the complete documentation pipeline — all document scopes, functional overview, technical overview,
architecture blueprint, and navigation index — in a single command.

This command is the fastest route from a completed scan to a fully documented solution.
Individual commands (`/document`, `/fdd`, `/tdd`, `/blueprint`, `/index`) remain available for
re-running specific sections when artefacts change.

## Usage

```
/generate
```

No arguments. `/generate` always runs the full pipeline.

---

## Pre-condition Check

Read `docs-generated/component-inventory.md`.

If the file does not exist, stop immediately:

> `/scan` has not been run yet. Run `/scan` first to build the component inventory, then run `/generate`.

If the file exists but its header shows it is more than 7 days old (check the `Generated:` timestamp), print a warning and continue:

> ⚠ Component inventory is more than 7 days old. Consider re-running `/scan` before generating to ensure documentation reflects the current state of `input/`.

Check whether any files already exist under `docs-generated/` beyond `component-inventory.md` and the `history/` folder. If yes, print a warning before starting:

> ⚠ Existing generated documents will be overwritten. All files in `docs-generated/` (except `component-inventory.md` and `history/`) will be replaced. If you want to preserve the current state, commit to git before continuing.

---

## Steps

Execute the following commands in sequence. For each step:

- If the component type was **not found** during `/scan` (inventory shows 0 counts), skip the step and note it in the summary — do not fail.
- If a step produces an error or file cannot be written, note it as `⚠ FAILED` and continue to the next step.
- Do not re-run `/scan` — the inventory is the starting point.

### Step 1 — `/document entities`

Read `docs-generated/component-inventory.md` for entity counts.
If 0 entities: skip — note "No entities found in inventory."
Otherwise: generate `docs-generated/functional/entity-catalogue.md`.

### Step 2 — `/document forms-views`

If 0 forms and 0 views in inventory: skip.
Otherwise: generate `docs-generated/functional/forms-and-views.md`.

### Step 3 — `/document security`

If 0 security roles in inventory: skip.
Otherwise: generate `docs-generated/functional/security-model.md`.

### Step 4 — `/document flows`

If 0 Power Automate flows and 0 classic workflows in inventory: skip.
Otherwise: generate `docs-generated/functional/flows.md`.

### Step 5 — `/document plugins`

If 0 plugin steps in inventory: skip.
Otherwise: generate `docs-generated/technical/plugins/{AssemblyName}.md` (one file per assembly).

### Step 6 — `/document web-resources`

If 0 web resources in inventory: skip.
Otherwise: generate `docs-generated/technical/web-resources/{namespace}.md`.

### Step 7 — `/document pcf`

If 0 PCF controls in inventory: skip.
Otherwise: generate `docs-generated/technical/pcf/{ControlName}.md`.

### Step 8 — `/document custom-apis`

If 0 custom APIs in inventory: skip.
Otherwise: generate `docs-generated/technical/custom-apis.md`.

### Step 9 — `/document integrations`

If 0 Azure Functions and 0 Logic Apps in inventory: skip.
Otherwise: generate `docs-generated/integrations/integration-topology.md` and per-resource files.

### Step 10 — `/document adf`

If 0 ADF pipelines in inventory: skip — note "No ADF artifacts found in inventory."
Otherwise: generate `docs-generated/data-migration/adf-topology.md` and per-pipeline files.

### Step 11 — `/document reporting`

If 0 SSRS reports and 0 Power BI files in inventory: skip — note "No reporting artifacts found in inventory."
Otherwise: generate `docs-generated/reporting/reporting-inventory.md` and per-report files.

### Step 12 — `/fdd`

Generate `docs-generated/functional/functional-overview.md`.
This step always runs — it synthesises from whatever component docs were generated in steps 1–11.

### Step 13 — `/tdd`

Generate `docs-generated/technical/technical-overview.md`.
This step always runs.

### Step 14 — `/blueprint`

Generate:
- `docs-generated/architecture/solution-blueprint.md`
- `docs-generated/architecture/data-model.md`
- `docs-generated/architecture/dependency-map.md`
- `docs-generated/architecture/impact-map.md`

This step always runs.

### Step 15 — `/index`

Generate `docs-generated/00-index.md`.
This step always runs last — it links to every generated document with its status.

---

## Completion Report

```
GENERATE COMPLETE
═════════════════
Project         : {project-name}
Inventory date  : {timestamp from component-inventory.md}

Steps completed : {N} / 15

  Step  1  /document entities      : {completed | skipped — {reason} | ⚠ FAILED — {reason}}
  Step  2  /document forms-views   : {completed | skipped | ⚠ FAILED}
  Step  3  /document security      : {completed | skipped | ⚠ FAILED}
  Step  4  /document flows         : {completed | skipped | ⚠ FAILED}
  Step  5  /document plugins       : {completed | skipped | ⚠ FAILED}
  Step  6  /document web-resources : {completed | skipped | ⚠ FAILED}
  Step  7  /document pcf           : {completed | skipped | ⚠ FAILED}
  Step  8  /document custom-apis   : {completed | skipped | ⚠ FAILED}
  Step  9  /document integrations  : {completed | skipped | ⚠ FAILED}
  Step 10  /document adf           : {completed | skipped | ⚠ FAILED}
  Step 11  /document reporting     : {completed | skipped | ⚠ FAILED}
  Step 12  /fdd                    : {completed | ⚠ FAILED}
  Step 13  /tdd                    : {completed | ⚠ FAILED}
  Step 14  /blueprint              : {completed | ⚠ FAILED}
  Step 15  /index                  : {completed | ⚠ FAILED}

Files written   : {N total files across all steps}
Flags raised    : {N} ⚠ items across all documents

Handoff packages:
  Data Migration agent : {docs-generated/data-migration/adf-topology.md | not produced}
  Reporting agent      : {docs-generated/reporting/reporting-inventory.md | not produced}

Output root     : docs-generated/
Navigation      : docs-generated/00-index.md

To re-run a single section:
  /document {scope}  — re-generate one document scope
  /fdd               — re-generate functional overview
  /tdd               — re-generate technical overview
  /blueprint         — re-generate architecture blueprint
  /index             — re-generate navigation index
```
