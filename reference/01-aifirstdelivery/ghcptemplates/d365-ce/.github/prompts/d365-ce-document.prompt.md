---
mode: agent
description: "Generate all documentation for a completed D365 CE feature — deployment guide, release notes, test cases, technical design, and plugin registration. Use when the user wants post-implementation documentation. Triggers on: 'document feature', 'generate docs', 'create deployment guide', 'release notes'."
---

Generate all documentation for a completed D365 CE feature.

## Steps

1. Read `constitution/09-document-generation-rules.md` for all rules.
2. Identify the feature. If not specified, ask.
3. Read all artifacts for the feature:
   - `specs/{feature-name}/spec.md` and `review.md`
   - `plans/{feature-name}/plan.md`
   - All files in `tasks/{feature-name}/`
   - All generated code in `output/{feature-name}/src/`
4. Determine which documents to generate using the trigger table in `constitution/09-document-generation-rules.md`.
5. Generate each applicable document into `docs-generated/{feature-name}/`.
6. Print a generation manifest.

## Documents to Generate

### functional-spec-final.md
Polished version of the spec for business stakeholders. Remove technical jargon. Add a glossary.

### technical-design.md
- Architecture overview (what components were built)
- Data model changes (tables, columns, relationships)
- Plugin registration details (entity, message, stage, mode, rank, filtering attributes)
- Web resource registrations (name, type, forms registered on)
- Security model changes (new roles, privileges, field security)
- Integration points (if any)
- Environment variable definitions

### plugin-registration.md
For each plugin step:
| Plugin Class | Entity | Message | Stage | Mode | Rank | Filtering Attributes | Images |
|---|---|---|---|---|---|---|---|

### deployment-guide.md
- Pre-deployment checklist
- Step-by-step deployment instructions per environment
- Environment variable values required (leave blanks for secrets)
- Post-deployment verification steps
- Rollback procedure

### test-cases.md
For each task's acceptance criteria — formatted as a QA test case table:
| TC-ID | Description | Pre-conditions | Steps | Expected Result | Status |

### release-notes.md
- Feature summary (1 paragraph, business language)
- Changes made (bullet list)
- Known limitations
- Dependencies / pre-requisites

### user-guide.md  *(only if UI changes were made)*
- Step-by-step user instructions with form/field names as they appear in the UI
- Screenshots placeholder markers: `[SCREENSHOT: {description}]`

## Generation Manifest Format
```
DOCUMENTS GENERATED — {feature-name}
─────────────────────────────────────
✓ functional-spec-final.md
✓ technical-design.md
✓ plugin-registration.md
✓ deployment-guide.md
✓ test-cases.md
✓ release-notes.md
✗ user-guide.md — skipped (no UI changes detected)
```
