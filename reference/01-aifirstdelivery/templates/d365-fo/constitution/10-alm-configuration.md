# ALM Configuration — D365 F&O

> **Project-wide settings** (ADO connection, area path, iteration path, work item type names,
> field mapping, priority mapping, status mapping) are defined once in `../../alm-configuration.md`.
> Do not duplicate those settings here — configure only the domain-specific overrides below.

---

## Work Item Hierarchy Override

D365 F&O uses a **2-level flat hierarchy** — this overrides the standard 4-level hierarchy
defined in `../../alm-configuration.md`. Each X++ object maps to one Task under a single Requirement Epic.

| Template Level | ALM Type | ID Prefix | Description |
|---|---|---|---|
| Level 1 — Epic | Epic | EP | The overall requirement / functional area |
| Level 2 — Task | Task | T | One X++ object or configuration item |

> **Azure DevOps:** Epic → Task only. No Feature or User Story intermediary.
> **Jira:** Epic → Story (map Level 2 to Story if Task is not a standalone type in your project).
