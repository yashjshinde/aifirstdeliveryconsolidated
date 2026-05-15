---
applyTo: "output/**"
description: "Solution Architect constitution rules — auto-injected when editing solution blueprint artifacts. Enforces architecture-level synthesis, cross-platform pattern compliance, and completeness requirements."
---

# Solution Architect Constitution — Always-On Rules

These rules apply to ALL Solution Architect artifacts. They are hard constraints, not suggestions.

## Scope Rules

- **Architecture level only** — no code snippets, no Power Fx formulas, no X++ pseudocode, no task steps
- **Synthesis, not listing** — the blueprint must deduplicate and merge cross-domain components into a unified view
- **Single source of truth** — the same component name must be used consistently across all sections and all diagrams

## Synthesis Rules

- Cross-domain components (shared Dataverse tables, shared security roles, shared integration endpoints) must appear once with all consuming domains noted
- Cross-domain dependencies must be explicit: direction (A→B or bidirectional), trigger event, data contract, and latency expectation
- Never copy-paste domain TDDs — always synthesise into architecture patterns

## Completeness Gate

All 10 sections are required before the blueprint is considered COMPLETE:
1. System Context
2. Solution Architecture Overview
3. Component Architecture
4. Data Architecture
5. Integration Architecture
6. Security Architecture
7. ALM Architecture
8. NFR Coverage
9. Technical Risks
10. Open Architecture Decisions

All mandatory Mermaid diagrams must be embedded (not referenced externally).

## Diagram Standards

- All diagrams: Mermaid syntax only — no external diagram tools
- System context: `graph LR` with external actors as separate nodes
- Component: `graph TD` with subgraphs per domain
- Data flow: `sequenceDiagram` for key transaction flows
- Standard colour coding: read from `constitution/03-diagram-standards.md`

## Traceability

Every component in the blueprint must trace to:
- Business capability → Feature → Functional Requirement
- Domain agent artefact (spec, TDD, or plan) that defines it

## Cross-Platform Patterns

Only use approved integration patterns from `constitution/02-cross-platform-patterns.md`.
Flag any pattern that deviates as an Architecture Risk with severity rating.
