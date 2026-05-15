# validate-config

The CI gate that validates every JSON config under `/config/` against the framework JSON Schemas and the rule catalog from [`detailed-design/01-config-schemas.md`](../../detailed-design/01-config-schemas.md).

## Install

```powershell
py -3 -m pip install -e .
```

## Use

Full CLI reference, exit codes, allowlist format, output formats, and the complete rule catalog are in [`docs/tool-reference.md` §validate-config](../../docs/tool-reference.md#validate-config). Quick examples:

```powershell
py -3 -m validate_config <repo-root>/config             # default human output
py -3 -m validate_config <repo-root>/config --strict    # CI mode
```

## Tests

```powershell
py -3 -m pip install -e ".[dev]"
py -3 -m pytest -v
```
