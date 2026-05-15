# Quality Rules — Non-Negotiable Documentation Enforcement

This file defines the quality gates that every generated document must pass before it is considered complete.
These rules exist because the purpose of generated documentation is to help team members understand the application in detail — not just to confirm that components exist.

---

## The One Rule

> **If a team member reads the documentation and still needs to open the source code to understand what a component does, the documentation has failed.**

Every document must be detailed enough that a developer who has never seen the codebase can understand:
- What the component does (business purpose)
- How it does it (logic, conditions, data it reads/writes)
- When it runs (trigger conditions)
- What it affects (downstream entities, flows, integrations)

---

## Prohibited Patterns — Zero Tolerance

The following patterns are forbidden in all generated output. If you find yourself writing any of these, stop and document the individual components instead.

### Grouping Prohibition
```
❌ "Other Entity Scripts (~38 additional JS files) — remaining scripts follow the same OnLoad/OnChange pattern"
❌ "Additional flows (12 total) follow the same approval notification pattern"  
❌ "Similar entities: [list of names]" with no individual sections
❌ "See entity above for field structure"
❌ "N/A — same as [ComponentName]"
```

### Count-Only Tables
```
❌ | Entity Name | Count |
   | pub_clinic  | 47 fields |
```
A count says nothing about what the fields are.

### Vague Purpose Descriptions
```
❌ "This plugin handles business logic for the entity."
❌ "This flow performs the required operations."
❌ "This web resource manages form behaviour."
```
Describe the specific business logic, specific operations, specific behaviour.

### Deferred Documentation
```
❌ "[To be documented]"
❌ "[See source file]"  
❌ "[Details TBD]"
❌ Leaving a section heading with no content beneath it
```

---

## Required Evidence Chain

Every documented behaviour must trace back to evidence in the source artefacts.

| Claim Type | Required Evidence |
|---|---|
| "This plugin creates a record on entity X" | Show the `service.Create()` call and entity name from source |
| "This field is required" | Show `RequiredLevel=Required` from attribute XML |
| "This flow triggers when status = Active" | Show the filter expression from the flow trigger JSON |
| "This role has Org-level Read on pub_clinic" | Show the `<RolePrivilege>` depth code from role XML |
| "This report uses FetchXML / SQL" | Show the actual `<CommandText>` from the RDL dataset |
| "This JS function sets the field value" | Show the `getAttribute("...").setValue(...)` call |

Never write "this component appears to..." or "this likely does..." without a `⚠ NEEDS REVIEW` flag.

---

## Self-Check Before Completing Any Scope

Before declaring a scope complete, ask these questions:

### For `/document entities`:
- [ ] Does every custom entity have its own `###` section?
- [ ] Does every entity have a field dictionary table with all custom fields?
- [ ] Does every OptionSet field have all its option values listed?
- [ ] Does every entity have its Status Reason values documented?
- [ ] Are entities grouped by feature domain (not alphabetically)?

### For `/document plugins`:
- [ ] Has the Execute() method source been read for every plugin class?
- [ ] Is the decision logic (if-then conditions) explicitly listed?
- [ ] Are all Dataverse operations (entity + fields) listed?
- [ ] Are all external HTTP calls documented (URL, method, auth)?
- [ ] Are all `InvalidPluginExecutionException` messages extracted verbatim?

### For `/document web-resources`:
- [ ] Does every JS file have its own `###` section?
- [ ] Does every function in every file appear in the function table?
- [ ] Are deprecated `Xrm.Page.*` calls flagged?
- [ ] Are all fields read and written by each function listed?

### For `/document flows`:
- [ ] Does every flow have its own `###` section?
- [ ] Is the trigger filter expression extracted verbatim?
- [ ] Is the action sequence numbered and fully described?
- [ ] Are all classic workflows listed individually in the summary table?

### For `/document security`:
- [ ] Has every role XML been read?
- [ ] Does the privilege matrix cover all custom entities?
- [ ] Are field security profiles documented?
- [ ] Are integration/service roles separated from human user roles?

### For `/document reporting`:
- [ ] Has the SQL `<CommandText>` been extracted verbatim from every RDL dataset?
- [ ] Are all report parameters documented (name, type, default)?
- [ ] Are column/field mappings documented?

---

## Handling Large Component Counts

When a solution contains many components (e.g. 90 web resources, 84 flows), the instinct is to group them.
This instinct must be resisted. Use these strategies instead:

### Feature Domain Grouping
Organise components under business capability headings. Each component still gets its own `###` section.

```markdown
## HSG Onboarding Lifecycle
### pub_hsgclinic (HSG Clinic)
[full entity documentation here]

### pub_hsgenrolment (HSG Enrolment)  
[full entity documentation here]

## PCN Clinic-Doctor Relationships
### pub_pcnclinic (PCN Clinic)
[full entity documentation here]
```

### Tabular Summary + Detail Pattern
For flows and plugins: provide a summary table at the top (quick reference) followed by individual `###` sections with full detail.

```markdown
## Flow Summary

| # | Name | Trigger | Entity | Purpose |
|---|---|---|---|---|
| 1 | Notify Clinic on Enrolment | Record Created | pub_hsgenrolment | Sends welcome email |
| 2 | ... | | | |

## Flow Detail

### 1. Notify Clinic on Enrolment
[full flow documentation here]
```

### Parallel Processing
Run documentation generation in feature domain batches rather than trying to document all components in a single pass. This prevents quality degradation from context overload.

---

## Quality Failure Recovery

If a prior `/generate` run produced low-quality output (grouped components, count-only tables, vague descriptions):
1. Do not simply re-run `/generate` — the same gaps will recur unless the source files are re-read
2. Re-read the relevant input files for the failing scope
3. Apply the minimum content standards from `constitution/03-documentation-standards.md`
4. Rewrite the affected sections individually

---

## Documentation vs Inventory

| Inventory (insufficient) | Documentation (required) |
|---|---|
| "90 web resources registered" | Each of the 90 files documented with functions, fields, events |
| "84 Power Automate flows" | Each of the 84 flows documented with trigger, action sequence, business purpose |
| "162 custom entities" | Each entity with field dictionary, relationships, cross-references |
| "13 SSRS reports" | Each report with SQL extracted, parameters documented, columns mapped |

The `/scan` command produces inventory. The `/document` command must produce documentation.
