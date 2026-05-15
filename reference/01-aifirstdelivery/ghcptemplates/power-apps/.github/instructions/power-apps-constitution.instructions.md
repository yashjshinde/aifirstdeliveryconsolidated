---
applyTo: "specs/**,plans/**,tasks/**,output/**,docs-generated/**"
description: "Power Apps constitution rules — auto-injected when editing Power Platform delivery artifacts. Enforces Config-First, delegation safety, solution layering, and connection reference requirements."
---

# Power Apps Constitution — Always-On Rules

These rules apply to ALL Power Platform delivery artifacts. They are hard constraints, not suggestions.

## Architectural Principles

- **Configuration First:** OOB → Low-code → Pro-code — never skip levels without documented justification
- **Delegation Awareness:** all Canvas App data queries must be delegation-safe for large Dataverse datasets
- **Reusable Child Flows:** shared logic extracted to named child flows — never duplicated across flows
- **Solution Layering:** all components in managed solutions — never use Default Solution
- **Dataverse as System of Record:** all business data in Dataverse — no shadow SharePoint lists or Excel stores
- **Connection References Always:** named connection references — never direct connection handles

## Dataverse Schema

- Table schema names: `{prefix}_{tablename}` — all lowercase, underscores only
- Column schema names: `{prefix}_{columnname}` — all lowercase, underscores only
- Publisher prefix: read from `constitution/04-dataverse-schema.md`
- No over-constraining schema — only mark Required when the business rule is enforced

## Canvas Apps

- Screen naming: `{Domain}Screen` (e.g., `HomeScreen`, `DetailScreen`)
- Control naming: `{Type}_{Purpose}` (e.g., `Btn_Save`, `Lbl_Title`, `Gal_Products`)
- No hardcoded GUIDs or environment-specific values — use Environment Variables
- WCAG 2.1 AA accessibility required on all screens

## Power Automate

- Flow naming: `{Domain} — {Purpose}` (e.g., `Expense — Approval Notification`)
- All actions renamed descriptively — no default names
- Error handling scope wrapping main actions on all flows

## Security

- Azure AD groups for role assignment — never individual user assignment
- DLP policies evaluated before any new connector usage
- No Dataverse security bypass — plugins must never use system user context unless justified

## Testing

- Canvas App: Test Studio for UI flows
- Flow testing: separate test environment with representative data
- Minimum 80% coverage for any custom code components
