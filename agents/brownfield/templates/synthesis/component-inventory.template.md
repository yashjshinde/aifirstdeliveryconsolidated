<!--
component-inventory.template.md - Project-level roll-up of every artifact.
Reads: inventory.json
Emits: docs-generated/inventory.md
Rendered by brownfield-engine/synthesis-runner.ts.
-->
---
artifact: synthesis-component-inventory
project: "{project}"
generated-at: "{generatedAt}"
generated-by: brownfield-engine
inventory-version: "{inventoryVersion}"
---

# Component Inventory — {project}

> Roll-up of every artefact enumerated by `/scan`. Generated from `inventory.json`. Module-gated artefact types not detected in this solution are listed as `Skipped (module not installed)`.

## AI Summary

This component inventory covers {totalArtefactCount} artefacts across {platformCount} platforms detected in `{project}`. Modules detected: {detectedModulesList}.

## Detected modules

{detectedModulesTable}

## Inventory by platform

### d365-ce ({ceArtefactCount} artefacts)

{cePerCategoryTable}

### d365-fo ({foArtefactCount} artefacts)

{foPerCategoryTable}

### integration ({integrationArtefactCount} artefacts)

{integrationPerCategoryTable}

### reporting ({reportingArtefactCount} artefacts)

{reportingPerCategoryTable}

### power-apps ({powerAppsArtefactCount} artefacts)

{powerAppsPerCategoryTable}

### power-pages ({powerPagesArtefactCount} artefacts)

{powerPagesPerCategoryTable}

### custom-pages ({customPagesArtefactCount} artefacts)

{customPagesPerCategoryTable}

## Module-gated skips

| Artefact category | Skip reason |
|---|---|
{moduleSkipsTable}

## Sources scanned

> Every input file/folder that contributed to this inventory.

{sourcesScannedList}

## Cross-references

- [docs-generated/00-index.md](00-index.md) — master navigation
- [docs-generated/coverage-report.md](coverage-report.md) — documentation status per artefact
- [docs-generated/gap-log.md](gap-log.md) — typed gap entries
- [docs-generated/functional/functional-overview.md](functional/functional-overview.md)
- [docs-generated/technical/technical-overview.md](technical/technical-overview.md)
- [docs-generated/architecture/solution-blueprint.md](architecture/solution-blueprint.md)

---

_Synthesis doc rendered by `brownfield-engine/synthesis-runner.ts`. Source: `inventory.json` extracted {generatedAt}._
