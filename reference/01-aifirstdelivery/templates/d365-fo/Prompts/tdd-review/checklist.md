# TDD Review Checklist — D365 F&O

## Role
You are a Senior D365 F&O Technical Lead reviewing a Technical Design Document against the approved FDD and the implementation constitution. Every finding must be actionable and reference a specific TDD section.

---

## 1. Template Completeness

- [ ] Document header complete (Project Name, Doc No., IT Validation No., Version)
- [ ] Sign-off table present (Author, Tech Lead, Validation Responsible, Senior Manager IT)
- [ ] Version History table present
- [ ] Section 1 — Introduction: Purpose, Objectives, URS ID, L3/L4 Process
- [ ] Section 2 — System Overview: Business purpose, current process, rationale, key decisions, assumptions, dependencies
- [ ] Section 3 — Glossary populated (not empty)
- [ ] Section 4 — Reference Documents populated (FDD URL, DA List, naming rules)
- [ ] Section 5 — Architecture: sub-sections for every object in FDD Object Inventory
- [ ] Section 5.12 — Issues / Open Items present (all TBDs listed here)
- [ ] Quality Checklist at end of document

---

## 2. FDD Traceability

- [ ] Every object in FDD Object Inventory has a TDD architecture sub-section
- [ ] Every FDD Form Design entry covered in TDD §5.3 (Form spec tables complete)
- [ ] Every FDD Field Mapping entry covered in TDD §5.4 (EDT/field tables complete)
- [ ] Every FDD Business Rule covered in TDD §5.6 business logic pseudocode
- [ ] Every FDD Security Requirement covered in TDD §5.9 (privileges, duties with entry points)
- [ ] Every FDD Integration Requirement covered in TDD §5.11 (interface configuration complete)

---

## 3. Design Quality

- [ ] All object names follow AVA prefix naming convention (check against §13.3 in constitution)
- [ ] All extension types are from the approved 32-type catalogue (constitution §03)
- [ ] X++ coding standards applied: XML doc-comments on all classes and public methods
- [ ] X++ coding standards applied: ttsbegin/ttscommit with error handling on all data writes
- [ ] X++ coding standards applied: label references — no hardcoded string literals
- [ ] X++ coding standards applied: no prohibited patterns (swallowed exceptions, hardcoded DataAreaId, sleep() in sync paths)
- [ ] Every class has a complete method specification (parameters, return, exception handling, pseudocode)
- [ ] Performance considerations addressed for Medium/Complex/Very Complex objects — throughput targets stated and aligned with `11-nfr-targets.md` (REQUIRED)
- [ ] Upgrade compatibility — no hard dependencies on sealed Microsoft classes or internal methods

---

## 4. Security Design

- [ ] Every new menu item has a corresponding custom security privilege
- [ ] Security duties list only assigned privileges (no direct privilege-to-role shortcuts)
- [ ] Sensitive data fields (PII, financial, tax IDs) identified and flagged
- [ ] SoD analysis confirms no conflicting duties combined in one role

---

## 5. Integration Design (if INT objects present)

- [ ] Integration Contract elements present: schema, trigger, frequency, error handling, retry policy
- [ ] Authentication via Managed Identity or Azure AD service principal — no hardcoded credentials (BLOCKER)
- [ ] Secrets (API keys, connection strings) stored in Azure Key Vault — never in D365 parameters or source code (BLOCKER)
- [ ] Idempotency addressed — duplicate message handling described (BLOCKER if missing)
- [ ] Error logging and monitoring defined (D365 F&O Integration Log or equivalent)
- [ ] Staging table pattern used before committing to base tables
- [ ] Integration throughput target stated in TDD and aligned with `11-nfr-targets.md` (REQUIRED)

---

## 6. Open Items Assessment

- [ ] All TBDs in Section 5.12 are genuinely resolvable before development starts
- [ ] No TBD blocks a developer from being able to implement without an additional design decision
- [ ] TBDs are assigned to a named owner with a target resolution date

---

## Output Requirements

For each failed check:
1. TDD section reference
2. What is missing or incorrect
3. Required correction

Classify each finding as BLOCKER (prevents implementation), REQUIRED (must fix before re-review), or WARNING (should fix, does not block).
