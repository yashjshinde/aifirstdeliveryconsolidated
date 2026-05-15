---
applyTo: "docs/**,plans/**,tasks/**,output/**"
description: "D365 F&O constitution rules — auto-injected when editing F&O delivery artifacts. Enforces extension-over-modification, naming conventions, upgrade compatibility, and ALM standards."
---

# D365 F&O Constitution — Always-On Rules

These rules apply to ALL D365 F&O delivery artifacts. They are hard constraints, not suggestions.

## Architectural Principles

- **Extension Over Modification** — NEVER modify Microsoft base objects; use CoC, Table Extensions, Form Extensions
- **No Overlayering** — this is an absolute prohibition; raise as a Constitution Blocker
- **Configuration First** — Parameters → Workflows → Alerts → Business Events → X++ (in this order)
- **Minimum Footprint** — every object must map to a specific business requirement; no objects "for future use"
- **Upgrade Compatibility** — no sealed Microsoft class dependencies; no hardcoded `DataAreaId`; use `curExt()`

## Object Naming

- Object-IDs assigned from category prefix: `EXT-NNN` (Extensions), `DEN-NNN` (Data Entities), `INT-NNN` (Integrations), `SEC-NNN` (Security), `WFL-NNN` (Workflows), `BDC-NNN` (Batch/Business Documents), `OPR-NNN` (Operational Reports)
- All custom objects use the project prefix (read from `constitution/03-extension-coding-standards.md`)
- No hardcoded `DataAreaId` references — use `curExt()` or pass as parameter

## X++ Standards

- All methods must have XML doc-comments on class and method
- No `select` statements inside loops — use `join` or set-based operations
- No hardcoded labels — use label references only
- Catch all exceptions; re-throw user-visible errors with correct error level
- Unit tests: SysTestCase framework, one test method per pseudocode branch, cover positive and negative paths

## ALM and DevOps

- Every custom object registered with Object-ID before development begins
- Very Complex objects require Solution Architect approval before development starts
- Source control: all X++ objects in ISV project per environment strategy from `constitution/04-development-and-alm.md`

## Non-Functional Targets

Read specific targets from `constitution/11-nfr-targets.md`. Key minimums:
- Standard form load: ≤ 3 seconds
- Form save (no batch): ≤ 2 seconds
- Simple batch throughput: ≥ 50,000 records/hour
- Availability: 99.9% uptime — custom code must not degrade this

## Constitution Override Procedure

If a deviation is required:
1. Flag as a **Constitution Exception Request** in the relevant document
2. State the rule being deviated from and the business justification
3. Propose a compliant alternative
4. Never silently violate a constitution rule
