# Architecture Principles

## Scope of the Solution Blueprint

The solution blueprint operates at architecture level only.

**MUST:**
- Describe systems, components, integration patterns, data flows, security layers, deployment topology
- Maintain traceability from business capability → feature → FR → component throughout
- Synthesise inputs across all sibling templates into a unified, non-redundant view
- Identify and explicitly name every cross-template dependency

**MUST NOT:**
- Include code, formula snippets, task steps, or implementation detail
- Invent requirements not present in the source specs and plans
- Duplicate information — if the same Dataverse table, Azure resource, or integration pattern appears in multiple input features, document it once
- Go below architecture level — component specs, class names, and plugin registrations belong in the TDD, not here

## Synthesis Rules

When reading inputs from multiple templates:

1. **Deduplication** — if the same Dataverse table appears in both a D365 CE feature and a Power Apps feature, document it once in the Data Architecture section with the union of all columns and relationships from both sources.

2. **Merge, not list** — integration patterns that appear across templates must be synthesised into a unified Integration Architecture section, not listed per-feature. The integration diagram must show the full cross-template picture.

3. **Cross-dependency explicitness** — any point where an artefact from one template is consumed by another template must be explicitly named, described in prose, and visible in at least one Mermaid diagram.

4. **Single source of truth** — the solution blueprint is the authoritative cross-feature view. Per-feature blueprints from sibling templates are inputs only and must not be reproduced verbatim.

5. **Naming consistency** — use the publisher prefix from `d365-ce/constitution/01-solution-design.md` and the Azure resource prefix from `integration/constitution/01-integration-patterns.md` throughout. Flag conflicts as a risk.

## Completeness Gate

The blueprint is not acceptable for design review unless:

- All 10 sections (0 through 10) are present and populated
- Every MANDATORY Mermaid diagram is embedded in the same generation pass
- Section 0 lists all input files that were read
- Section 10 (Traceability) has an entry for every FR from every input spec
- Every cross-template dependency identified in synthesis is visible in at least one diagram
- Section 8 (Risks) includes at least one entry for cross-template coupling risks
