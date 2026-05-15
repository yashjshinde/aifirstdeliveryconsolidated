# Tool reference

Comprehensive CLI reference for the three Python tools. This doc is the **single source of truth** for tool usage. The per-tool READMEs inside `tools/<tool>/` are minimal install docs that point back here.

## Installation

```powershell
# from repo root, one-time
py -3 -m pip install -e tools/validate-config
py -3 -m pip install -e tools/excel_to_json
py -3 -m pip install -e tools/dataflow-codegen
```

The tools install in editable mode — changes to the source take effect immediately, no reinstall needed.

You can invoke each tool two ways:

| Form | Example | When to use |
| --- | --- | --- |
| Console-script entry point | `validate-config config` | After `pip install` adds the `Scripts/` folder to PATH |
| Module form | `py -3 -m validate_config config` | Always works regardless of PATH |

The module form is recommended for scripts and CI — it doesn't depend on shell-PATH configuration.

---

## `validate-config`

The CI gate. Validates every JSON config under `/config/` against the framework schemas (draft 2020-12) plus 24 cross-file rules from the [rule catalog](../detailed-design/01-config-schemas.md#6-validate-config-rule-catalog).

### Synopsis

```
validate-config [CONFIG_ROOT] [--schemas DIR] [--allowlist FILE] [--strict] [--output FORMAT]
```

### Arguments

| Arg | Default | Purpose |
| --- | --- | --- |
| `CONFIG_ROOT` | `./config` | Root of the config tree to validate |
| `--schemas DIR` | `CONFIG_ROOT/schemas` | Schema directory |
| `--allowlist FILE` | `CONFIG_ROOT/.validate-config.allowlist.jsonl` (if present) | Path to allowlist |
| `--strict` | false | Promote warnings to errors |
| `--output FORMAT` | `human` | `human`, `github`, or `json` |

### Exit codes

| Code | Meaning |
| --- | --- |
| 0 | No errors. Warnings may exist (unless `--strict` promoted them). |
| 1 | At least one error after allowlist filtering. |
| 2 | Configuration problem (schemas dir missing, allowlist parse error). |
| 3 | Internal exception inside the tool itself. |

### Output formats

**`human`** — color-coded TTY output. Each finding rendered as:

```
V010 error C:\...\config\waves\oracle_fusion_daily.json
  wave references unknown entityKey 'ghost' (no /config/entities/ghost.json)
  at: /entities/0/entityKey
```

**`github`** — GitHub Actions workflow commands. One line per finding:

```
::error file=C:\...\customer.json,line=1,col=1,title=V004::entityKey 'cust' does not match filename 'customer'
```

**`json`** — structured payload for programmatic consumers (dashboards, custom notifiers). Shape:

```json
{
  "summary": { "errors": 0, "warnings": 7, "suppressed": 0 },
  "findings": [ ... ],
  "suppressed": [ ... ]
}
```

### Allowlist format

JSONL — one JSON object per line, blank lines and `#` comment lines tolerated.

```jsonl
# alias-curation pending, opt out of V023 temporarily
{"rule":"V023","file":"entities/customer.json","jsonPointer":"/fields/8/transform/forward/entitySetName","reason":"opx_country is irregular plural — verified in DV metadata","added":"2026-05-13T00:00:00Z"}
```

Required keys: `rule`, `reason`. Optional: `file`, `jsonPointer`, `added` (ISO-8601 UTC).

**Allowlist entries older than 90 days become errors** (code `V998`). Either fix the underlying issue or renew the `added` date with a fresh justification — the design prevents allowlists from becoming forever-shelves.

### Rule coverage

24 rules implemented across these groups (full descriptions in [`../detailed-design/01-config-schemas.md` §6](../detailed-design/01-config-schemas.md#6-validate-config-rule-catalog)):

| Range | Group | Status |
| --- | --- | --- |
| V001–V007 | Schema-level | V001, V002, V003 handled via jsonschema; V004, V005, V006, V007 implemented |
| V010–V015 | Cross-file | V010, V011, V012, V013, V015 implemented; V014 deferred |
| V020–V028 | Transform completeness | V020, V021, V022, V023, V025, V026, V028 implemented; V024, V027 deferred |
| V030–V034 | Wave DAG | V030, V031, V032, V033 implemented; V034 deferred |
| V040–V045 | Direction-specific | V040, V041 implemented; V042, V043, V045 deferred |
| V050–V052 | Operational | V050, V051 implemented; V052 deferred |
| V060–V065 | Runtime (`pl_preflight`) | Implemented in ADF, not in this CLI |

**Deferred** rules are tracked in [`../implementation.md`](../implementation.md) §7 (Design revisions).

### Examples

```powershell
# Most common: validate everything in CI
validate-config config --strict --output github

# Validate a different config root
validate-config /path/to/some-other-config-tree

# Use an alternative allowlist
validate-config config --allowlist .validate-config.prod-allowlist.jsonl --strict

# Get JSON output for a dashboard
validate-config config --output json | jq '.summary'
```

---

## `excel-to-json`

Converts the analyst-authored Excel mapping workbook into one JSON config per sheet. See [authoring-mappings.md](authoring-mappings.md) for the workbook conventions.

### Synopsis

```
excel-to-json WORKBOOK [-o OUT_DIR]
```

### Arguments

| Arg | Default | Purpose |
| --- | --- | --- |
| `WORKBOOK` | (required) | Path to the `.xlsx` mapping workbook |
| `-o`, `--out-dir DIR` | `config/entities` | Where to write the per-sheet JSON files |

### Exit codes

| Code | Meaning |
| --- | --- |
| 0 | One or more sheets converted successfully |
| 1 | Workbook unreadable or zero sheets recognized |
| 2 | Bad arguments |

### What's automated vs manual

**Automated:**
- One JSON file per workbook sheet (sheet name → `<lowercase>.json`)
- All field rows converted to `fields[]` entries
- `transform.type` inferred from "Transformation Logic" prose (deterministic keyword matcher)
- Source/target schema names, types, mandatory flag, max length
- Alternate key list built from "Key Type" column

**Left blank for the human:**
- `lookup.entitySetName` and `lookup.navigationProperty` — these come from Dataverse metadata, not the workbook
- `choice.forward.map` — fill from the option-set definition in Dataverse
- `relationships[]` and `postLoadActions[]` — the workbook's prose-shaped trailing rows are not auto-parsed
- Default values where the workbook left them blank

Run `validate-config` immediately after `excel-to-json` to see what's still missing.

### Transform-type inference table

| Prose pattern (case-insensitive) | Inferred type |
| --- | --- |
| `Direct` or blank | `direct` |
| Contains `statecode` or `state code` | `state` |
| Contains `Map.*Choice` or `Choice.*Map` | `choice` |
| Contains `Map.*lookup` or `lookup.*code` or `resolve lookup` | `lookup` |
| Contains `check.*column.*value.*set as.+Y` | `conditional` |
| Contains `Map Y/N` or `Y\s*/\s*N` field | `yesNo` |
| Contains `UTC time` or `UTC time zone` | `dateTime` |
| Anything else | `direct` (fallback) |

The patterns live in `tools/excel_to_json/excel_to_json/converter.py`. Add new ones with a regression test in `tools/excel_to_json/tests/test_converter.py`.

### Examples

```powershell
# Default: write to config/entities/
excel-to-json "Backup 01 CustomerDataMapping - Copy.xlsx"

# Custom output location
excel-to-json "<workbook>" -o /tmp/regenerated-entities/

# Round-trip check — regenerate then diff against committed
excel-to-json "<workbook>" -o /tmp/regen
diff -r config/entities /tmp/regen
```

The diff approach is useful in CI to catch unintentional drift between the workbook and the committed JSON.

---

## `dataflow-codegen`

Generates ADF Mapping Data Flow ARM JSON from each entity config. Output goes to `/adf/dataflows/generated/`.

### Synopsis

```
dataflow-codegen [--config-root DIR] [--out-dir DIR] [--entity NAME]
```

### Arguments

| Arg | Default | Purpose |
| --- | --- | --- |
| `--config-root DIR` | `./config` | Root of the config tree (must contain `entities/` and `_project.json`) |
| `--out-dir DIR` | `./adf/dataflows/generated` | Where to write the generated ARM JSON |
| `--entity NAME` | (all entities) | Generate for one entity only |

### Exit codes

| Code | Meaning |
| --- | --- |
| 0 | All generated successfully |
| 1 | One or more entities failed (malformed config or codegen bug) |
| 2 | Bad arguments |

### What gets generated

For each entity in `/config/entities/`:

- If `direction ∈ {inbound, bidirectional}`: `df_transform_<entityKey>_inbound.json`
- If `direction ∈ {outbound, bidirectional}`: `df_transform_<entityKey>_outbound.json`

Each file is a complete `Microsoft.DataFactory/factories/dataflows` ARM resource with valid MDF script lines.

### Determinism

Output is **byte-deterministic** for the same input. Re-running with no config changes produces identical files. **Commit the output** so the diff between a config change and its Data Flow consequence is visible in code review.

### When to regenerate

Re-run after any of:

- `/config/entities/<X>.json` changed → `dataflow-codegen --entity X`
- `/config/aliases/*` changed → regenerate every entity that references the file
- `/config/_project.json` changed (project-level defaults like `masterBroadcastThresholdRows`)
- `tools/dataflow-codegen` itself was updated (engine version bump)

A CI step that regenerates and diffs against committed output catches "forgot to regen" mistakes.

### Examples

```powershell
# All entities, default paths
dataflow-codegen

# After editing one entity, regenerate just it
dataflow-codegen --entity customer

# Generate to an alternate location (e.g. for diffing)
dataflow-codegen --out-dir /tmp/regen
diff -r adf/dataflows/generated /tmp/regen
```

### Coverage and limitations

**Implemented:** all 10 transform types (direct, concat, split, conditional, map, choice, state, yesNo, dateTime, lookup). Real ADF Mapping Data Flow expression syntax (verified against `learn.microsoft.com/azure/data-factory/data-flow-expression-functions`). Alias resolution + normalize chain on lookup/choice/state.

**Limitations:**

- **Validation routing.** The current generated flow writes valid rows to `sinkFinal` and relies on the load step's `enableSkipIncompatibleRow` for invalid rows. A field-level Conditional Split that routes to a `sinkTransformErrors` sidecar is a v2 enhancement.
- **Alias-suggestion sink.** The `onMissing:"suggestion"` semantics are designed (spec §3.3.4) but the generated flow doesn't yet emit `sinkAliasSuggestions`. Affected rows currently land via the Copy activity's row-level error log.
- **Outbound conditional transforms with multiple `reverse.writes[]`.** The generator emits the first write only. For full coverage of multi-output reverse conditionals, model each output column as a separate `direct` field in the entity config.

These limitations are tracked in [`../implementation.md`](../implementation.md) §7 and revisited per the post-MVP audit.

---

## Combined workflow

The canonical loop:

```powershell
# 1. Analyst edits the workbook
excel-to-json "Backup 01 CustomerDataMapping - Copy.xlsx" -o config/entities/

# 2. (Engineer) fills the human-only bits in the JSONs

# 3. Validate
validate-config config

# 4. Regenerate Data Flow ARM JSON
dataflow-codegen --config-root config --out-dir adf/dataflows/generated

# 5. Commit everything
git add config/ adf/dataflows/generated/
git commit -m "<entity>: <description of change>"
git push
```

CI re-runs steps 3 and 4 and diffs the regenerated output against the committed version — if they don't match, the PR fails.

### Sample CI workflow (GitHub Actions)

```yaml
name: validate configs
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - name: install tools
        run: |
          pip install -e tools/validate-config
          pip install -e tools/dataflow-codegen
      - name: validate-config
        run: validate-config config --strict --output github
      - name: dataflow-codegen regenerate + diff
        run: |
          dataflow-codegen --config-root config --out-dir /tmp/regen
          diff -r adf/dataflows/generated /tmp/regen
```

The diff step ensures generated Data Flow JSONs in source control match what codegen would produce from current configs — fails the PR if someone edited a generated file by hand or forgot to regenerate after a config change.

## Running the tests

Each tool ships with a pytest suite:

```powershell
py -3 -m pip install -e "tools/validate-config[dev]"
py -3 -m pip install -e "tools/excel_to_json[dev]"
py -3 -m pip install -e "tools/dataflow-codegen[dev]"

# Run from each tool's directory (pytest's path resolution doesn't play well across siblings)
cd tools/validate-config   ; py -3 -m pytest -v
cd tools/excel_to_json     ; py -3 -m pytest -v
cd tools/dataflow-codegen  ; py -3 -m pytest -v
```

Current state: **34/34 tests passing**.

## Extending the tools

### Adding a new `validate-config` rule

1. Add `(severity, description, doc_url)` tuple to `RULE_CATALOG` in `tools/validate-config/validate_config/errors.py`.
2. Add a `def rule_VXXX(state: ConfigState) -> list[Finding]:` function to `tools/validate-config/validate_config/rules.py`.
3. Register it in the `RULES` list at the bottom of `rules.py`.
4. Add a `test_VXXX_*` in `tools/validate-config/tests/test_validate_config.py` with both a pass and fail fixture.
5. Update the rule table in [`../detailed-design/01-config-schemas.md` §6](../detailed-design/01-config-schemas.md).

### Adding a new transform type

1. Add the type name to the `type` enum in `config/schemas/entity-mapping.schema.json`'s `$defs.transform.oneOf`, including the type-specific `$defs.tfXxxForward`.
2. Add a `tf_xxx(field: dict) -> list[tuple[str, str]]` function to `tools/dataflow-codegen/dataflow_codegen/templates.py`.
3. Register in the `TEMPLATES` dispatch table at the bottom of `templates.py`.
4. Add tests in `tools/dataflow-codegen/tests/test_generator.py`.
5. Add the reverse counterpart in `tools/dataflow-codegen/dataflow_codegen/generator.py` `_reverse_expression()` if the type should be bidirectional.
6. Update [`../detailed-design/02-pipelines-and-dataflows.md` §18](../detailed-design/02-pipelines-and-dataflows.md).

### Adding a new `excel-to-json` transform inference rule

1. Add a `(pattern, transform_type)` entry to `_INFERENCE_RULES` in `tools/excel_to_json/excel_to_json/converter.py`.
2. Add a `test_inference_<name>` unit test in `tools/excel_to_json/tests/test_converter.py` with the exact prose string the analyst would write.

Patterns are matched in order — more specific patterns should come before more general ones.
