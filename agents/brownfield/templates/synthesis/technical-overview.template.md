<!--
technical-overview.template.md - Project-level technical roll-up.
Reads: all per-artifact docs
Emits: docs-generated/technical/technical-overview.md
-->
---
artifact: synthesis-technical-overview
project: "{project}"
generated-at: "{generatedAt}"
generated-by: brownfield-engine
---

# Technical Overview — {project}

> Engineering-facing roll-up. Per-artefact docs are linked; this document aggregates technical decisions, counts, and patterns.

## AI Summary

This technical overview covers {totalArtefactCount} artefacts across all platforms in `{project}`. Code-asset counts: {codeAssetCount}. Schema-asset counts: {schemaAssetCount}. Process-asset counts: {processAssetCount}. Integration-asset counts: {integrationAssetCount}.

## §1 Data model

### Entities (Dataverse / FO tables) — top 20 by attribute count

| Entity | Platform | Attribute count | Plugin-step count | Form count | Cross-ref doc |
|---|---|---|---|---|---|
{topEntitiesRows}

Full entity list: [docs-generated/technical/data-model/](../technical/data-model/).

## §2 Code surface

### Plugins (CE)

| Plugin class | Steps | Avg-step-complexity | Cross-ref doc |
|---|---|---|---|
{ceCustomCodeRows}

### Custom Workflow Activities (CE)

| CWA | Inputs | Outputs |
|---|---|---|
{cwaRows}

### JavaScript web resources (CE)

| Web resource | Functions | Form bindings | Ribbon bindings |
|---|---|---|---|
{jsWebResourceRows}

### X++ classes (FO)

| Class | Methods | CoC extensions on this class |
|---|---|---|
{xppClassRows}

### Azure Functions (integration)

| Function | Trigger | Auth mode | Idempotency strategy |
|---|---|---|---|
{azureFunctionRows}

## §3 UI surface

| Type | Count | Notable |
|---|---|---|
{uiSurfaceRows}

## §4 Process automation

| Type | Count | Average step count |
|---|---|---|
{processSummaryRows}

## §5 Security surface

| Domain | Role count | FLS profile count | Privileges granted (total) |
|---|---|---|---|
{securitySurfaceRows}

## §6 Integration surface

| Type | Count | Pattern category |
|---|---|---|
{integrationSurfaceRows}

## §7 Reporting surface

| Type | Count | Notable |
|---|---|---|
{reportingSurfaceRows}

## §8 Technical decisions (mechanically observed)

> Where every per-artifact doc cites the same ADR pattern, recorded here.

| Decision | Evidence count | Citing docs |
|---|---|---|
{technicalDecisionsRows}

## §9 Test-coverage observed

> Unit tests detected in the source. Aspirational targets per [d365-ce/constitution/07-testing.md](../../../d365-ce/constitution/07-testing.md) etc.

| Surface | Detected test count | Aspirational target |
|---|---|---|
{testCoverageRows}

## §10 Cross-references

- [docs-generated/00-index.md](../00-index.md)
- [docs-generated/inventory.md](../inventory.md)
- [docs-generated/coverage-report.md](../coverage-report.md)
- [docs-generated/architecture/solution-blueprint.md](../architecture/solution-blueprint.md)
- [docs-generated/architecture/integration-topology.md](../architecture/integration-topology.md)
- Per-artefact docs: `docs-generated/technical/{category}/`

---

_Synthesis doc. Counts mechanically derived from inventory + per-artefact docs._
