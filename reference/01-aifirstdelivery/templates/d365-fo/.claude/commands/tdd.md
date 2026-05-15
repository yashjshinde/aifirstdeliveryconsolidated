Generate a Technical Design Specification (TDS/TDD) for a D365 F&O requirement, based on an approved FDS. The TDS strictly follows the IT System Design Specification template and must be implementation-ready — developers derive X++ objects, pseudocode, and method signatures directly from it.

## Usage

```
/tdd {requirement-name}
```

---

## Step 1 — Load Constitution

Read every file in `constitution/` before proceeding.

## Step 2 — Check Gate

Read `docs/{requirement-name}/fdd-review.md`.

If status is not `FDD APPROVED`, stop:
```
GATE BLOCKED
════════════
FDD review status is not FDD APPROVED.
Run /fdd-review {requirement-name} and resolve all BLOCKERs before generating the TDD.
```

## Step 3 — Load TDD Template and FDD

Read both:
- `doc-templates/tdd-template.md` — the IT System Design Specification structure that must be followed exactly
- `docs/{requirement-name}/fdd.md` — the approved FDD that drives all TDD content

## Step 4 — Generate TDD

Generate the complete TDD following the template structure. The TDD must be:
- **Template-faithful** — same section order and headings as the template (no omissions)
- **Implementation-ready** — clear design decisions, X++ object specifications, pseudocode, dependencies
- **Traceable** — every major design element references the FDD section and business requirement

### Section-by-section generation rules:

**Section 1 — Introduction:** Purpose, objectives, URS ID, L3/L4 process mapping.

**Section 2 — System Overview:** Business purpose and intended use, current process, rationale for customisation, key technical decisions (options considered, decision + rationale, risks), assumptions and dependencies.

**Section 5 — Architecture (most critical):**

Generate a sub-section for every object identified in the FDS Object Inventory. For each object type:

- **§5.3 Updates to Form:**
  - 5.3.1 Form Extensions — per form: Data Sources table, Action on Form Data Source Events table, Design Controls table, Action on Form Design Control Events table
  - 5.3.2 New Forms — same structure as extensions
  - 5.3.3 Menu Item Extensions — state "N/A" if none
  - 5.3.4 New Menu Items — state "N/A" if none
  - 5.3.5 Menu Extensions — state "N/A" if none
  - 5.3.6 New Menus — state "N/A" if none

- **§5.4 Updates to Data Dictionary** (in this order):
  - 5.4.1–5.4.2 Base Enum Extensions / New Base Enums — `Base Enum Value | Name | Label | Configuration Key`
  - 5.4.3 New EDTs — `Name | Type | Label | String Size | Configuration Key | Help Text | Enum Type`
  - 5.4.4–5.4.5 Query Extensions / New Queries — state "N/A" if none
  - 5.4.6–5.4.7 View Extensions / New Views — state "N/A" if none
  - 5.4.8–5.4.9 Data Entity Extensions / New Data Entities — use `Data Entity | Field | Change` table for extensions
  - 5.4.10–5.4.11 Table Extensions / New Tables — use full attribute block (`Name | Country Region Code | Created by | Form Ref | Modified by`) + Fields table (`Name | Type | Extended Data Type | Allow Edit | Allow Edit on Create | Mandatory`)

- **§5.5 SSRS Reports** — state "N/A" if not in scope

- **§5.6 Business Logic:** Start with a Class Summary table (`Class Name | Purpose | Notes`), then one sub-section per class with class metadata + method-by-method pseudocode, parameters, exception handling, FDS section reference

- **§5.7 Interface Logic** — state "N/A" if no INT objects

- **§5.8 Workflows** — state "N/A" if no workflow changes

- **§5.9 Security** — privileges and duties; if none needed state "N/A" and explain how existing roles cover access (ref FDS §6.4)

- **§5.10 Label Files** — `Language | Label ID | Text` — one row per new label (field captions, error messages)

- **§5.11 Interface Configuration** — state "N/A" if no external interfaces

- **§5.13 Authentication** — state "Standard D365 F&O authentication" if no additional mechanism

- **§5.14 Data Encryption** — state "Standard D365 F&O encryption" if no additional requirements

**Quality rules:**
- Use `<TBD>` for genuinely unknown values — do not leave sections empty
- Add all unknowns to §5.12 Issues / Open Items with the section reference
- Every method must have a pseudocode block; error messages in pseudocode must use exact text from FDS
- Naming must follow prefix conventions from `constitution/03-extension-coding-standards.md`
- Every object must reference its Object-ID (e.g., EXT-001) from the FDS §5 Object Inventory

## Step 5 — Write Output

Write to `docs/{requirement-name}/tdd.md`.

## Step 6 — Print Completion Report

```
TDS COMPLETE
════════════
Requirement  : {requirement-name}
Objects      : {N} objects designed  ({N} EXT, {N} DEN, {N} INT, ...)
Form Ext     : {N} form extensions (§5.3.1)
Table Ext    : {N} table extensions (§5.4.10)
Entity Ext   : {N} data entity extensions (§5.4.8)
Classes      : {N} business logic classes (§5.6)
Labels       : {N} new labels (§5.10)
Open Items   : {N} TBD items in §5.12
Output       : docs/{requirement-name}/tdd.md

Next step: /tdd-review {requirement-name}
```
