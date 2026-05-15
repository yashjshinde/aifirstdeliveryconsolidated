Generate all documentation for a completed Power Platform feature.

## Steps

1. Read `constitution/09-document-generation-rules.md`.
2. Identify the feature. If not specified, ask.
3. Read all artifacts: spec, review, plan, task cards, and `output/{feature}/`.
4. Determine applicable documents from the trigger table.
5. Generate each document to `docs-generated/{feature-name}/`.
6. Print generation manifest.

## Document Content Rules

### app-design.md
- Screen inventory: name, purpose, data source, navigation targets
- Navigation flow — Mermaid `graph LR` showing screen-to-screen navigation with trigger conditions
- Named formulas and global variables with purpose
- Delegation status of all Filter/Search/Sort operations
- Component reuse list

### flow-documentation.md
For each flow:
- Trigger type and configuration
- Step-by-step action table: | Step | Action | Purpose | Connection Reference |
- Error handling path description
- Environment variables consumed
- Run history retention setting

### copilot-design.md
- Topic inventory with trigger phrase samples
- Conversation flow per topic (step-by-step with branch conditions)
- Entity list with type (prebuilt / custom)
- Variable inventory (scope, purpose)
- Power Automate actions invoked
- Escalation path

### deployment-guide.md
- Pre-deployment checklist (connection references to create, env vars to set)
- Solution import steps per environment
- Post-import steps (turn on flows, share app with groups)
- Rollback procedure

## Generation Manifest
```
DOCUMENTS GENERATED — {feature-name}
─────────────────────────────────────
✓ functional-spec-final.md
✓ technical-design.md
✓ app-design.md
✓ flow-documentation.md
✓ deployment-guide.md
✓ test-cases.md
✓ release-notes.md
✓ user-guide.md
✗ copilot-design.md — skipped (no Copilot Studio tasks)
```
