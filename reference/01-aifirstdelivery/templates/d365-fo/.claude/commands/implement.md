Implement a single D365 F&O object from an approved plan. Reads the plan object details and the relevant TDD section, generates the X++ code or configuration artefact, produces an implementation record, and updates the feature tracker.

## Usage

```
/implement {requirement-name}/{Object-ID}
```

Examples:
```
/implement qms-validation/EXT-001
/implement qms-validation/DEN-042
/implement qms-validation/INT-022
```

---

## Step 1 — Load Constitution

Read every file in `constitution/` before proceeding.

## Step 2 — Check Gate

Read `plans/{requirement-name}/plan-review.md`.

If status is not `PLAN APPROVED`, stop:
```
GATE BLOCKED
════════════
Plan review status is not PLAN APPROVED.
Run /plan-review {requirement-name} first.
```

## Step 3 — Load Object Context

1. Read `plans/{requirement-name}/plan.md` — find the object section for `{Object-ID}`
2. Read `docs/{requirement-name}/tdd.md` — find the matching architecture sub-section(s)
3. Read `docs/{requirement-name}/fdd.md` — cross-reference business rules and form design for this object

## Step 3b — Cross-Feature Pre-requisite Check

Read `plans/_component-registry.md` if it exists:
- Look up `{Object-ID}` / `{Object Name}` in the registry and in the **Cross-Feature Dependencies** section of `plans/{requirement-name}/plan.md`
- If this object has a **SEQUENTIAL** dependency on another requirement's object: confirm the prerequisite object exists in `output/` or has `status: DONE` in its owning plan. If not, stop:
  ```
  CROSS-FEATURE DEPENDENCY NOT MET
  ═══════════════════════════════════
  {Object-ID} ({Object Name}) depends on {other-requirement}/{other-object}
  which has not been implemented yet.
  Complete {other-requirement}/{other-object} first, then re-run /implement.
  ```
- If this object has a **CONFLICT** with another requirement's object: do not stop, but prepend a warning block to the implementation record:
  ```
  > ⚠ CONFLICT WARNING: {Object Name} is also claimed by {other-requirement}.
  > Coordinate with that feature team before merging this artefact into the solution.
  ```
- If no cross-feature overlaps affect this object: proceed silently.

## Step 4 — Mark IN PROGRESS

Update the object's `status` to `IN PROGRESS` in `plans/{requirement-name}/plan.md`.

Create or update `tasks/{requirement-name}/tracker.md` (first time creates it from `tasks/_tracker-template.md`).

## Step 5 — Generate Artefact

Generate output based on object category and type:

### Extensions (EXT) — X++ code

| Object Type | What to generate |
|---|---|
| Form Extension | `.Extension` object: data source modifications, design control additions, event handler wiring |
| Table Extension | `.Extension` object: field additions, field groups, index, relation, event handlers |
| Class Extension (CoC) | `_Extension` class: wrapped method with `next` call, pre/post logic |
| New Class | Full class with XML doc-comment, all methods with pseudocode implemented, ttsbegin/ttscommit where applicable |
| New Table | Full table with all fields, field groups, primary index, and methods; SysTableLog via RecId |
| New Form | Full form with data sources, design controls, and event handler wiring |
| Event Handler Class | Full class with all pre/post event handler methods |
| Batch Class | Full class extending RunBase with `run()`, `dialog()`, `getFromDialog()` methods |
| All X++ | XML doc-comments on class, label references (no hardcoded strings), AVA prefix, no prohibited patterns |

Output path: `output/{requirement-name}/src/{ObjectType}/{ObjectName}.xpp`

#### X++ Unit Tests — SysTestCase (business logic objects only)

For the following object types, also generate an X++ unit test class using the SysTestCase framework:
- New Class
- Class Extension (CoC)
- Event Handler Class
- Batch Class (test `run()` logic via mock or minimal dataset)

**Unit test output path:** `output/{requirement-name}/tests/{ObjectName}_Test.xpp`

Each test class must:
- Extend `SysTestCase`
- Include one test method (`testMethod_`) per pseudocode branch in the TDD
- Cover the positive path (business rule satisfied) and at least one negative path (validation fires)
- Use `SysTestCase::assertEqual`, `assertNotNull`, `assertFalse` assertions
- Mock or set up minimal data within the test — never rely on pre-existing DEV data
- Include XML doc-comment on the class and every test method

Example structure:
```xpp
/// <summary>
/// Unit tests for AVA_QMS_QualityValidator
/// </summary>
[TestFixtureAttribute]
class AVA_QMS_QualityValidator_Test extends SysTestCase
{
    [SysTestMethodAttribute]
    public void testValidate_PassStatus_DoesNotBlock()
    {
        // Arrange
        // Act
        // Assert
        SysTestCase::assertTrue(true, "Pass status should not block posting");
    }

    [SysTestMethodAttribute]
    public void testValidate_FailStatus_ThrowsError()
    {
        // Arrange
        // Act + Assert
        // Use try/catch to verify exception is thrown
    }
}
```

> **Note:** Test case documentation (TC-001, TC-002…) is created earlier by `/testplan`. The SysTestCase code generated here is the runnable implementation of the unit test scenarios from the test plan.

### Data Entities (DEN)

Generate: Data Entity class with all data source mappings, field mappings, staging table definition, validation logic.
Output: `output/{requirement-name}/src/DataEntities/{EntityName}.xpp`

### Integrations (INT)

Generate: Interface class, Azure resource configuration spec (`output/{requirement-name}/src/Integration/{IntegrationName}/`):
- Integration class X++
- `integration-config.md` — Azure resources, auth, error handling per TDD Section 5.11

### Security (SEC objects within EXT)

Generate: Security metadata XML or configuration notes (`output/{requirement-name}/src/Security/`):
- Privilege definition with entry points
- Duty definition with privilege assignments
- Role definition sheet if a new role

### Workflows (WFL)

Generate: Workflow configuration specification (`output/{requirement-name}/src/Workflows/{WorkflowName}-config.md`)

### Business Documents (BDC), Operational Reports (OPR)

Generate: SSRS report design notes and RDP class (`output/{requirement-name}/src/Reports/`)

### Configuration only (Very Simple / Simple)

Generate: `output/{requirement-name}/src/Config/{ObjectName}-config.md` — step-by-step configuration instructions

## Step 6 — Generate Implementation Record

Write to `output/{requirement-name}/impl-docs/{Object-ID}-{slug}-impl.md` using `doc-templates/impl-doc-template.md`:

- Implementation Summary (what was built/configured)
- Files / Artefacts Created (list with paths)
- Configuration Steps (for non-code objects)
- Build Status (X++ objects: code compiles, no warnings)
- Deviations from TDD (none expected; document if any)
- Manual Steps Required (plugin registration, metadata deployment, etc.)
- Test Evidence — per TDD section, AC sign-off (PASS / FAIL / PARTIAL)

## Step 7 — Mark DONE

- Update `status: DONE` on the object in `plans/{requirement-name}/plan.md`
- Update `impl-doc-path` on the object to the impl-doc path
- Update `tasks/{requirement-name}/tracker.md` with DONE status, impl-doc link, completion percentage

## Step 8 — Print Completion Report

```
IMPLEMENT COMPLETE
══════════════════
Object    : {Object-ID} — {Object Name}
Category  : {category}
Type      : {object type}
Status    : DONE
Artefacts : {list of files created}
Impl Doc  : output/{requirement-name}/impl-docs/{Object-ID}-{slug}-impl.md
Tracker   : tasks/{requirement-name}/tracker.md updated ({N}% complete)
```
