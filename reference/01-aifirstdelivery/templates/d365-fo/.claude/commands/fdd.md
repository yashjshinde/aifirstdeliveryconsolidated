Generate a Functional Design Specification (FDS/FDD) for a D365 F&O requirement. The FDS is the first and most important document in the delivery process — all subsequent stages (TDD, Plan, Implementation) depend on it being complete and accurate.

## Usage

```
/fdd {requirement-name}
```

Provide a plain-language description of the business requirement when prompted, or supply an RSD/URS document.

---

## Step 1 — Load Constitution

Read every file in `constitution/` before proceeding. The constitution overrides all other instructions.

## Step 2 — Load FDD Template

Read `doc-templates/fdd-template.md`. The FDD must strictly follow this template structure. Every must-have section (marked ★) is mandatory — these sections enable TDD design and plan generation.

## Step 3 — Gather Inputs

If not already provided in the command arguments, gather:
- Business requirement description (plain language or RSD/URS document reference)
- Work Stream, ADO ID / URS ID, L3/L4 Process Name, Requirement Title (for §2 Scope table)
- Module(s) in scope (use approved module codes from constitution)
- Object categories involved (Form / Report / Integration / Batch Job / Workflow / Data Entity — best guess at this stage)
- Legal entities in scope (ECM / Engineering company, Commercial company, Manufacturing company)
- Any existing process documentation or wireframes available

## Step 4 — Generate FDD

Generate the complete FDD following the template structure. Observe these rules:

**Operating Principles:**
- Do NOT invent requirements or modify scope — only transform the input into structured FDD format.
- Maintain strict traceability: URS / Business Requirement → Object → Business Rule → Test Case.
- Use business language — no X++ code, no label IDs, no technical class names.
- Flag any functional gap discovered during elaboration as an open item for stakeholder review.

**Must-have sections (★) — do not leave these incomplete:**
- **§5 Object Inventory:** list all D365 F&O objects expected to be created or modified (Form Extensions, New Classes, Data Entities, etc.)
- **§6.2.1 Forms:** for every form in scope — Business Logic, GUI Form (navigation paths), Field Mapping (Field Name | Label | Table | Data Type | Length | Mandatory | Default Value | Description), Validation (with exact error message text), Functional Flow, Error Handling (with Notification Mechanism column)
- **§6.2.6 Data Entities:** list every entity extended, with field name and remarks
- **§6.4 Security Roles:** for each form/job — which D365 FO roles get access, Edit vs Read-only, SoD risks
- **Appendix A:** every URS/ADO ID → Object-ID → Validation ID → Security Role

**Other object types (Reports, Integrations, Batch Jobs, Workflows) — include only if in scope; state "N/A" if not.**

**Quality rules:**
- §2 Scope table must include ADO ID / URS ID, L3/L4 Process Name, Requirement Title, and Description for every requirement
- Every form field must have Data Type, Length, Mandatory flag, Default Value, and a description of cross-company behaviour where applicable
- Validation IDs (VAL-NNN) must include exact error/warning message text — no paraphrasing
- Error Handling tables must state Notification Mechanism: Pop-up, Infolog, Email, or None
- Business rules must be testable — each must have a clear pass/fail condition
- Do not go to implementation level — no X++ code, no label IDs, no class names

## Step 5 — Write Output

Write to `docs/{requirement-name}/fdd.md`.

Create the `docs/{requirement-name}/` folder if it does not exist.

## Step 6 — Print Completion Report

```
FDS COMPLETE
════════════
Requirement  : {requirement-name}
Module(s)    : {list}
Objects      : {N} objects in Object Inventory (§5)
Forms        : {N} forms specified in §6.2.1
Validations  : {N} VAL-NNN rules
Security     : {N} role-access rows in §6.4
Data Entities: {N} entities extended in §6.2.6
Output       : docs/{requirement-name}/fdd.md

Next step: /fdd-review {requirement-name}
```
