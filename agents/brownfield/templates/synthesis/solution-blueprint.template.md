<!--
solution-blueprint.template.md - Project-level solution blueprint roll-up.
Reads: all per-artifact docs + architecture inputs + cross-refs
Emits: docs-generated/architecture/solution-blueprint.md
-->
---
artifact: synthesis-solution-blueprint
project: "{project}"
generated-at: "{generatedAt}"
generated-by: brownfield-engine
---

# Solution Blueprint — {project}

> The cross-platform unified architecture for the existing solution. C4-L1/L2/L3 + security topology + data model + integration topology + reporting topology, all consolidated.

## AI Summary

This blueprint synthesises the existing `{project}` solution across {platformCount} platforms and {detectedModulesCount} detected modules. Total artefacts catalogued: {totalArtefactCount}. Gap-log entries: {gapLogCount} ({gapBlockerCount} BLOCKER / {gapWarningCount} WARNING / {gapInfoCount} INFO).

## §1 System context (C4-L1)

```mermaid
{systemContextMermaid}
```

## §2 Containers (C4-L2)

```mermaid
{containersMermaid}
```

## §3 Components — per platform

### d365-ce components

```mermaid
{ceComponentsMermaid}
```

### d365-fo components

```mermaid
{foComponentsMermaid}
```

### integration components

```mermaid
{integrationComponentsMermaid}
```

### reporting components

```mermaid
{reportingComponentsMermaid}
```

## §4 Data model overview

> ERD of conformed core entities (across CE + FO virtual entities / mirror).

```mermaid
{dataModelErdMermaid}
```

## §5 Solution layering

| Solution | Layer (base / extension / project-custom) | Publisher | Contents (summary) |
|---|---|---|---|
{solutionLayeringRows}

## §6 Security topology

| Domain | Role / Permission | Scope | Members |
|---|---|---|---|
{securityTopologyRows}

## §7 Cross-agent integration contracts

| Source agent | Target agent | Contract | Pattern | NFR |
|---|---|---|---|---|
{crossAgentContractsRows}

## §8 NFR matrix (consolidated)

| NFR | Target | Source platform | Verified |
|---|---|---|---|
{nfrMatrixRows}

## §9 Risk register (inferred from gap-log + anti-patterns)

| Risk | Severity | Mitigation |
|---|---|---|
{riskRegisterRows}

## §10 ADR roll-up

> ADRs cited across per-artefact docs. Mechanically deduplicated.

| ADR | Title | Cited by (count) |
|---|---|---|
{adrRollupRows}

## §11 Cross-references

- [docs-generated/00-index.md](../00-index.md)
- [docs-generated/inventory.md](../inventory.md)
- [docs-generated/coverage-report.md](../coverage-report.md)
- [docs-generated/gap-log.md](../gap-log.md)
- [docs-generated/functional/functional-overview.md](../functional/functional-overview.md)
- [docs-generated/architecture/integration-topology.md](integration-topology.md)
- [docs-generated/technical/technical-overview.md](../technical/technical-overview.md)

---

_Synthesis doc. Heuristic inferences marked **(inferred)** — reviewer to confirm._
