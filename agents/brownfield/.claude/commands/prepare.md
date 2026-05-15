---
description: Pre-flight check for brownfield inputs; verifies required source files are present
agent: brownfield
phase: PREP
gates: []
---

# /prepare

> Pre-flight validation of `_brownfield/input/` before `/scan`. Confirms expected source files per the platforms declared in `project.config.yaml brownfield.platforms`. Emits a `MISSING-INPUT` gap entry for every required-file absence; aborts on blockers.

## Usage

```
/prepare [--project <name>]
```

## Inputs

- `projects/{p}/project.config.yaml`:
  - `brownfield.platforms: [d365-ce | d365-fo | integration | reporting | power-apps | power-pages | custom-pages]`
- `projects/{p}/_brownfield/input/<platform>/` folders
- [`templates/scan/<platform>.template.md § Pre-flight`](../../templates/scan/) — per-platform required-file lists

## Execution flow

1. Read `project.config.yaml` → resolve `brownfield.platforms` list.
2. For each platform in the list:
   - Verify `_brownfield/input/<platform>/` exists and is readable
   - Apply per-platform pre-flight checks from the corresponding scan template § Pre-flight
   - Per missing required file: emit `MISSING-INPUT` gap entry with `severity: blocker`
   - Per oversized file (>500 MB): emit `MISSING-INPUT` warning (proceed but flag)
3. Run secret-redaction smoke check: scan for plaintext patterns (connection strings, keys) in input files. Emit info-level entries for any matches (reviewer should redact prior to scan).
4. Write `_brownfield/preflight-report.md` with findings.
5. Exit status:
   - **0** = all checks pass; `/scan` may proceed
   - **1** = blocker gap entries present; `/scan` will refuse to run

## Output

- `projects/{p}/_brownfield/preflight-report.md`
- `projects/{p}/_brownfield/gap-log.json` initialised (entries appended for missing inputs)

## See also

- [`constitution/04-input-file-types-base.md`](../../constitution/04-input-file-types-base.md)
- [`constitution/platforms/`](../../constitution/platforms/)
- [`schemas/brownfield-gap-log.v1.json`](../../schemas/brownfield-gap-log.v1.json)
