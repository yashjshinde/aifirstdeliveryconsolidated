# excel-to-json

Converts the analyst-authored Excel mapping workbook into one JSON config per sheet under `/config/entities/`.

## Install

```powershell
py -3 -m pip install -e .
```

## Use

Full CLI reference, inference rules, and the analyst workflow are in [`docs/tool-reference.md` §excel-to-json](../../docs/tool-reference.md#excel-to-json) and [`docs/authoring-mappings.md`](../../docs/authoring-mappings.md). Quick example:

```powershell
py -3 -m excel_to_json "<workbook>.xlsx" -o <repo-root>/config/entities/
```

## Tests

```powershell
py -3 -m pip install -e ".[dev]"
py -3 -m pytest -v
```
