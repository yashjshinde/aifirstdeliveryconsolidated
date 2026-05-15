---
applyTo: "output/**"
description: "ALM Agent constitution rules — auto-injected when editing ALM output files. Enforces ADO operation safety, confirmation requirements, and ID-back-write rules."
---

# ALM Agent — Always-On Rules

These rules apply to ALL ALM Agent operations. They are hard constraints, not suggestions.

## Configuration

- Always read `../../alm-configuration.md` first (shared project-wide ADO settings)
- Fall back to `constitution/10-alm-configuration.md` if the root file does not exist
- Work item type names, area paths, and iteration paths come from configuration — never hardcode

## Safety Rules

- **All cleanup commands are destructive** — always print a manifest and wait for explicit typed confirmation (e.g., "DELETE TREE 123") before any deletion
- Never delete more than requested — confirm scope before calling any delete tool
- Never overwrite ALM IDs that are already set in local documents

## Work Item Creation

- Always create in order: L1 → L2 → L3 → L4 (parent must exist before child)
- Use `ado_bulk_create_work_items` for hierarchy creation — never loop `ado_create_work_item` for bulk
- After any bulk creation, always run the corresponding sync command to write ADO IDs back

## ID Write-Back Rules

- After `/alm-wi-create-bulk`: update work-items.yaml, plan.md, task cards, and spec.md Section 13
- After `/alm-test-create`: update test-plan-and-strategy.md and all test suite files
- Never write partial updates — update all documents in one sync pass

## Wiki Sync

- Respect `sync-{doc}: false` toggles in constitution — never push disabled documents
- Always use `comment: "Synced from {domain}/{feature} by ALM Agent"` on every push

## MCP Server

- Verify connectivity before any tool call — call any read tool; if it fails, stop with setup instructions
- Never use curl or REST directly — always use `ado_*` MCP tools
- PAT is sensitive — never print it, never include in output files
