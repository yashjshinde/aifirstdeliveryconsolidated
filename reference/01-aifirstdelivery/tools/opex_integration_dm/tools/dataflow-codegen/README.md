# dataflow-codegen

Generates ADF Mapping Data Flow ARM JSON from each entity's config in `/config/entities/`. Output goes to `/adf/dataflows/generated/`.

## Install

```powershell
py -3 -m pip install -e .
```

## Use

Full CLI reference, codegen rationale, output structure, and limitations are in [`docs/tool-reference.md` §dataflow-codegen](../../docs/tool-reference.md#dataflow-codegen). Quick examples:

```powershell
# from repo root
py -3 -m dataflow_codegen --config-root config --out-dir adf/dataflows/generated

# just one entity
py -3 -m dataflow_codegen --entity customer
```

## Tests

```powershell
py -3 -m pip install -e ".[dev]"
py -3 -m pytest -v
```
