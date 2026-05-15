---
applyTo: "docs-generated/**"
description: "D365 CE Brownfield constitution rules — auto-injected when editing brownfield documentation. Enforces evidence-over-assumption, no-grouping quality rules, completeness, and flagging conventions."
---

# D365 CE Brownfield Constitution — Always-On Rules

These rules apply to ALL D365 CE Brownfield documentation. They are hard constraints, not suggestions.

## Core Principle: Evidence Over Assumption

- Only document what exists in the source files
- Permitted inferences: mark with *(inferred)* and cite the evidence
- Prohibited: inventing functionality, guessing purpose, summarising without evidence
- Conflict resolution: source code > XML > documents > naming convention inference

## The One Rule (Quality Gate)

**If a developer reads the documentation and still needs to open the source code to understand what a component does, the documentation has failed.**

## No Grouping Rule (Zero Tolerance)

These patterns are PROHIBITED:
- "follows the same pattern as..."
- "similar to..."
- Grouping multiple entities/plugins/JS files into one section
- "See above for details"
- "Additional scripts follow the same structure"

Every component gets its own individual section with full detail.

## Minimum Content Per Component Type

- **Entity:** field dictionary (every custom field), status reason values, key relationships
- **Plugin class:** every method's if-then logic, Dataverse operations, error messages verbatim
- **JS file:** every function — trigger, fields read/written, Xrm calls, custom actions invoked
- **Flow:** trigger filter condition verbatim, numbered action sequence, error handling
- **SSRS report:** FetchXML/SQL verbatim, parameters, dataset fields, known issues

## Flagging Conventions

Use exactly these flag prefixes:
- `⚠ SECURITY RISK` — credential exposure, unencrypted PII, missing field security
- `⚠ UPGRADE RISK` — deprecated API usage, sealed class dependency
- `⚠ TECHNICAL DEBT` — hardcoded GUID, duplicated logic, dead code
- `⚠ ORPHANED` — component with no registered step or no trigger
- `⚠ CIRCULAR DEPENDENCY` — plugin A triggers condition that fires plugin B which modifies A's entity
- `*(inferred)*` — conclusion drawn from indirect evidence

## Scope Boundaries

- Document what exists — do not redesign or recommend architectural changes
- Recommendations scoped as "consider addressing" — never prescriptive
- Never modify files in `input/` — read only
