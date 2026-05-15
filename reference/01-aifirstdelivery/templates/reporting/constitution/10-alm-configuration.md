# ALM Configuration — Reporting Agent

> **Project-wide settings** (ADO connection, area path, iteration path, work item type names,
> field mapping, priority mapping, status mapping) are defined once in `../../alm-configuration.md`.
> Do not duplicate those settings here — configure only the reporting-domain-specific overrides below.

---

Configure this file for the specific project before running any commands.

```yaml
# ── Project ─────────────────────────────────────────────────────────────────
project:
  name: ""                          # e.g., "Contoso Reporting"
  workspace-prefix: ""              # e.g., "Contoso-Reports"
  environment: ""                   # DEV | UAT | PROD

# ── Power BI Workspaces ──────────────────────────────────────────────────────
workspaces:
  dev:  ""                          # e.g., "Contoso-Reports-DEV"
  uat:  ""                          # e.g., "Contoso-Reports-UAT"
  prod: ""                          # e.g., "Contoso-Reports-PROD"

# ── Data Gateway ─────────────────────────────────────────────────────────────
gateway:
  name: ""                          # On-premises gateway name (if used)
  cluster-id: ""                    # Gateway cluster ID

# ── SSRS Server (if applicable) ──────────────────────────────────────────────
ssrs:
  enabled: false
  server-url: ""                    # e.g., "https://ssrs.contoso.com/ReportServer"
  report-folder: ""                 # e.g., "/Contoso/Reports"
  data-source-name: ""             # Shared data source name on SSRS

# ── Requirement Intake ────────────────────────────────────────────────────────
requirement-intake: structured    # unstructured | structured

# ── L3 Intake (only applies when requirement-intake: structured) ──────────────
l3-intake: optional                 # required | optional

# ── Brownfield Mode ───────────────────────────────────────────────────────────
# Set enabled: true when adding new reports to an existing reporting estate.
# docs-path points to the brownfield agent's docs-generated/ ROOT folder (not a subfolder).
# Path is relative to this template's root directory (templates/reporting/).
# Default assumes reporting and brownfield agents are sibling folders under templates/.
brownfield:
  enabled: false
  docs-path: ../d365-ce-brownfield/docs-generated

# When brownfield is enabled, every generative command reads the FULL brownfield
# documentation set before producing output. This includes entity catalogues, data model,
# functional overview, architecture, and reporting artefacts — so that KPIs and attributes
# can be mapped to existing D365 entities, fields, and reports rather than invented new.
#
# Documents read from {docs-path}:
#   component-inventory.md                  ← solution component counts
#   functional/entity-catalogue.md          ← all entities + attributes (primary KPI/attribute source)
#   functional/functional-overview.md       ← business process context
#   functional/security-model.md            ← security roles and access patterns
#   architecture/data-model.md              ← entity relationships and cardinality
#   architecture/solution-blueprint.md      ← solution architecture
#   reporting/reporting-inventory.md        ← existing reports, data sources, workspaces
#   reporting/ssrs/{ReportName}.md          ← per-SSRS-report detail (fields, parameters, queries)
#   reporting/power-bi/{ReportName}.md      ← per-Power-BI-report inventory
#
# | Command       | Brownfield behaviour                                                                      |
# |---------------|-------------------------------------------------------------------------------------------|
# | /spec         | Reads all docs above; maps each KPI and attribute to existing D365 entities/fields;       |
# |               | classifies requirements as NEW / EXTEND / REPLACE / REFERENCED. Adds §15 Brownfield       |
# |               | Context with field-level mapping table using exact names from entity-catalogue.md.        |
# | /review       | Checks that §15 field mapping is populated for any FR that touches an existing entity     |
# |               | or report.                                                                                 |
# | /impact       | Reads all docs above; produces full impact analysis — existing fields reused, new fields  |
# |               | required, entity/attribute gaps, RLS gaps. Required by /plan when enabled.                |
# | /plan         | Reads all docs above + impact-analysis.md; annotates tasks with brownfield-action and     |
# |               | lists which existing fields/measures are REUSED vs ADDED vs MODIFIED.                    |
# | /tdd          | Reads all docs above; uses entity-catalogue and data-model as the baseline; extends       |
# |               | existing _Measures table rather than duplicating; prefixes artefacts [REUSED/EXTENDED/NEW]|
# | /task         | Reads all docs above; populates Existing Fields from entity-catalogue and reporting docs; |
# |               | Technical Approach cites exact field names from brownfield inventory.                     |

# ── Reporting Defaults ────────────────────────────────────────────────────────
reporting:
  default-refresh-schedule: "Daily at 06:00 UTC"
  default-canvas-size: "1280x720"
  incremental-refresh:
    enabled: false
    archive-years: 3
    incremental-days: 7
  theme-file: ""                    # Path to project theme JSON, e.g., "output/theme.json"
```
