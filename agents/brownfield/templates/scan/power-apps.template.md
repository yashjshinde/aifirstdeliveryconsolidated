<!--
power-apps.template.md - SCAN TEMPLATE for the power-apps platform (Canvas apps + component libraries).
Consumed by /scan.
-->
---
platform: power-apps
scan-version: 1.0.0
consumed-by: brownfield-engine/extractor.ts
last-reviewed: 2026-05-15
---

# Scan Template — power-apps

## Pre-flight (`/prepare`)

- `_brownfield/input/power-apps/` exists
- At least one `.msapp` OR a Power Apps source folder (`Src/`, `OnStartFormula.txt`)

## Extraction walk (`/scan`)

### Step 1 — Unpack Canvas apps

For each `.msapp`:
- Unpack: `pac canvas unpack --msapp <file> --sources _brownfield/extracted/power-apps/<app-name>/`
- Walk the source folder per Step 2

If unpack tool unavailable → record `BLOCKED-BY-BINARY` gap for that app + emit inventory-level `canvas-app` artifact.

### Step 2 — Canvas app deep walk

For each unpacked Canvas app source folder:

```
Src/*.fx.yaml                       -> per-screen YAML containing controls + formulas
Connections/*.json                  -> per-connector connection refs
DataSources/*.json                  -> tabular data sources (Dataverse tables / SharePoint / SQL)
Themes.json                         -> app theme
Properties.json                     -> app metadata (Display name, OnStart formula, navigation defaults)
Resources/                          -> embedded assets
```

Emit:
- 1 `canvas-app` artifact per app folder
- Screen list (within the app artifact's `screens[]` field — NOT separate artifacts; screens are sections within the doc per [pattern ui-asset])
- Per connector found: cross-ref to `api-connection` artefact in integration platform

### Step 3 — Component library walk

For each Canvas component library `.msapp`:
- Same unpack treatment
- Emit `canvas-component-library` artifact (container) + per-component refs

### Step 4 — Custom Connectors used by Canvas apps

When `Connections/` references a custom connector:
- Emit a cross-ref to `custom-connector` in integration platform
- If connector definition file present locally → emit `custom-connector` artefact here

### Step 5 — Inventory.json output schema

Outputs to `inventory.platforms.power-apps`:

```yaml
canvas-app:
  - name: "MyCustomerApp"
    sourcePaths: ["_brownfield/extracted/power-apps/MyCustomerApp/"]
    screens: ["Home", "DetailScreen", "Settings"]
    dataSources: ["Account", "Contact", "MyConnector"]
    components: ["LibA.Header", "LibA.Footer"]
    onStartFormula: "..."   # short excerpt; full formula in artefact's doc
canvas-component-library:
  - name: "BrandComponentLib"
    components: ["Header", "Footer", "PrimaryButton"]
```

### Step 6 — Validate inventory coverage

`validate_inventory_coverage` against `inventory.platforms.power-apps`.

## Output schema

Conforms to [`schemas/brownfield-inventory.v1.json`](../../../schemas/brownfield-inventory.v1.json).

## See also

- [`constitution/platforms/power-platform.md`](../../constitution/platforms/power-platform.md)
- [`templates/bindings/d365-ce/`](../bindings/d365-ce/) (Canvas bindings cohabit the CE folder per [design/agents/brownfield.md § ~185 bindings](../../../design/agents/brownfield.md))
