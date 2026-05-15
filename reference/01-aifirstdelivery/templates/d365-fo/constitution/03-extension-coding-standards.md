# Extension Standards and X++ Coding

## Extension Object Types (32 types)

All custom X++ development under the Extensions category must be one of these types:

| # | Type | Description | Naming Pattern |
|---|---|---|---|
| 1 | Form Extension | Adds/modifies controls, data sources, or behaviour on existing forms | `<FormName>.Extension` |
| 2 | Form Data Source Extension | Extends a form's data source via event handlers | Part of Form Extension |
| 3 | Table Extension | Adds fields, field groups, indexes, relations, or methods to existing tables | `<TableName>.Extension` |
| 4 | Class Extension (CoC) | Wraps or augments standard method logic via Chain of Command | `<ClassName>_Extension` |
| 5 | View Extension | Adds fields, modifies ranges, or adjusts data sources on existing views | `<ViewName>.Extension` |
| 6 | Query Extension | Adds data sources, ranges, or sort orders to existing queries | `<QueryName>.Extension` |
| 7 | Data Entity Extension | Adds fields or modifies mapping on existing entities | `<EntityName>.Extension` |
| 8 | Menu Extension | Adds menu items or sub-menus to existing menus | `<MenuName>.Extension` |
| 9 | Menu Item Extension | Modifies properties on existing menu items | `<MenuItemName>.Extension` |
| 10 | Security Role Extension | Adds duties/privileges to existing standard roles | `<RoleName>.Extension` |
| 11 | Security Duty Extension | Adds privileges to existing security duties | `<DutyName>.Extension` |
| 12 | Security Privilege Extension | Adds entry points to existing security privileges | `<PrivilegeName>.Extension` |
| 13 | EDT Extension | Modifies properties (string size, label, help text, reference table) on existing EDTs | `<EDTName>.Extension` |
| 14 | Base Enum Extension | Adds new values to existing base enums | `<EnumName>.Extension` |
| 15 | New Table | Completely new custom table | `AVA_<Name>` |
| 16 | New Class | Completely new custom class | `AVA_<Name>` |
| 17 | New Form | Completely new custom form | `AVA_<Name>` |
| 18 | New Query | Completely new custom query | `AVA_<Name>` |
| 19 | New View | Completely new custom view | `AVA_<Name>` |
| 20 | New EDT | Completely new custom Extended Data Type | `AVA_<Name>` |
| 21 | New Base Enum | Completely new custom base enumeration | `AVA_<Name>` |
| 22 | New Menu Item | Completely new custom menu item (Display, Output, Action) | `AVA_<Name>` |
| 23 | New Menu | Completely new custom menu | `AVA_<Name>` |
| 24 | New Security Role | Completely new custom security role | `AVA_<Name>_Role` |
| 25 | New Security Duty | Completely new custom security duty | `AVA_<Name>_Duty` |
| 26 | New Security Privilege | Completely new custom security privilege | `AVA_<Name>_Privilege` |
| 27 | New Number Sequence | New custom number sequence scope/reference | `AVA_<Name>` |
| 28 | New Batch Job / Class | New custom batch job class | `AVA_<Name>_Batch` |
| 29 | New SSRS Report | New custom SSRS report object | `AVA_<Name>_Report` |
| 30 | New Label File | New custom label file | `AVA<Module>` |
| 31 | Event Handler Class | New class with pre/post event handlers for standard application events | `AVA_<TargetObject>_EventHandler` |
| 32 | Delegate / Plugin | New delegate definition or SysPlugin implementation | `AVA_<Name>_Plugin` |

## Naming Convention Summary

All custom objects reside in a custom model with the **AVA** prefix. No object may use the Microsoft standard layer prefix.

| Object Type | Pattern | Example |
|---|---|---|
| Model | `AVA_<Module>` | AVA\_Finance |
| Table extension | `<Table>.Extension` | CustTable.Extension |
| Class extension (CoC) | `<Class>_Extension` | SalesFormLetter\_Extension |
| Form extension | `<Form>.Extension` | SalesTable.Extension |
| New table | `AVA_<Name>` | AVA\_VendorApproval |
| New class | `AVA_<Name>` | AVA\_BudgetValidator |
| Event handler class | `AVA_<Target>_EventHandler` | AVA\_SalesTable\_EventHandler |
| Batch job class | `AVA_<Name>_Batch` | AVA\_VendorApprovalCleanup\_Batch |

## X++ Coding Standards

### Required

- All classes must have an XML doc-comment block: purpose, author, creation date.
- All public methods must have doc-comments: parameters and return values.
- All custom tables must define record ID strategy; include CreatedBy, CreatedDateTime, ModifiedBy, ModifiedDateTime.
- Transactions with data writes must use `ttsbegin` / `ttscommit` with explicit error handling and rollback.
- All hardcoded string literals replaced with label references.
- `select` statements on large tables must use indexed fields in WHERE clause. Full-table scans require Technical Lead approval.

### Prohibited

- `throw` without a meaningful error message
- `catch(Exception::Error)` swallowing exceptions silently
- Direct SQL (`Statement`, `ResultSet`) except with Technical Lead approval
- Hardcoded company (`DataAreaId`) references
- Hardcoded user IDs or email addresses
- `static void main()` for business logic — use proper class structures
- `sleep()` in synchronous code paths
- Overlayering standard Microsoft objects — extensions only

### Code Review Requirements

| Complexity | Reviewers Required | Approval Required |
|---|---|---|
| Very Simple | 1 peer developer | Technical Lead (async) |
| Simple | 1 peer developer | Technical Lead (async) |
| Medium | 1 peer + Technical Lead | Technical Lead (synchronous) |
| Complex | 2 peers + Technical Lead | Technical Lead + Solution Architect |
| Very Complex | 2 peers + Technical Lead + SA | Solution Architect + Programme Director |

No code may be merged to main without passing review. All comments must be resolved before merge.

## Non-Negotiable Extension Rules

1. **No overlayering.** Standard Microsoft objects must never be modified. Extensions only.
2. **No direct database access.** All data access through X++ data patterns or approved OData/custom service APIs.
3. **No hardcoded credentials.** Passwords, connection strings, and API keys never in source code or source-controlled config.
4. **No unreviewed code in non-DEV environments.**
5. **No unnamed extension objects.** Every object follows naming conventions. Unnamed or default-named objects prohibited outside DEV.
6. **Upgrade compatibility.** Every extension must survive a Microsoft platform update without manual rework.
