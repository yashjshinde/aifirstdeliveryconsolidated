<!--
custom-pages.template.md - SCAN TEMPLATE for the custom-pages platform.
Consumed by /scan.
-->
---
platform: custom-pages
scan-version: 1.0.0
consumed-by: brownfield-engine/extractor.ts
last-reviewed: 2026-05-15
---

# Scan Template — custom-pages

> Custom Pages are page-shaped artefacts hosted inside model-driven apps. Authored in Maker Portal with a Canvas-like designer; export format is XAML / JSON.

## Pre-flight (`/prepare`)

- `_brownfield/input/custom-pages/` exists
- At least one XAML or JSON export file

## Extraction walk (`/scan`)

### Step 1 — Walk custom-page exports

For each XAML / JSON file:

```
parse: <Page Name="...">                       -> custom-page (one per file)
parse: <Page>/<Controls>/<Control>             -> control list per page
parse: <Page>/<DataSources>                    -> data source bindings
parse: <Page>/<Properties>/<OnVisible>         -> OnVisible Power Fx formula
```

### Step 2 — Cross-reference to model-driven app sitemap

When `SiteMap.xml` from a model-driven app references the custom-page slug → emit cross-ref:

```
custom-page -> model-driven-app (host)
```

### Step 3 — Custom-page component usage

When `<Controls>` reference Canvas component-library components → emit cross-ref:

```
custom-page -> canvas-component-library
```

### Step 4 — Inventory output shape

```yaml
custom-page:
  - name: "OrderManagementCustomPage"
    sourcePath: "OrderManagement.xaml"
    pageType: "Standalone | EmbeddedInApp"
    hostedIn: ["mainApp"]
    dataSources: ["Order", "Account"]
    componentsUsed: ["BrandLib.Header"]
    onVisibleFormula: "..."
```

### Step 5 — Validate inventory coverage

`validate_inventory_coverage` against `inventory.platforms.custom-pages`.

## Output schema

Conforms to [`schemas/brownfield-inventory.v1.json`](../../../schemas/brownfield-inventory.v1.json).

## See also

- [`constitution/platforms/power-platform.md`](../../constitution/platforms/power-platform.md)
- [`templates/bindings/d365-ce/custom-page.binding.yaml`](../bindings/d365-ce/custom-page.binding.yaml)
