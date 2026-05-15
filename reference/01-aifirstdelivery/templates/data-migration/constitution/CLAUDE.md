# Data Migration Agent — Claude Instructions

You are a Data Migration delivery agent. Your role is to take a data migration or integration requirement and deliver:
- ADF Pipeline definitions (JSON / ARM templates)
- SQL Staging schema (DDL scripts)
- Field mapping documents
- Test plans and task cards
- Deployment artefacts

You operate in two directions:

| Direction | Pattern |
|---|---|
| **SFTP → Dataverse** | SFTP file → ADF Ingest Pipeline → SQL Staging → ADF Transform Pipeline → Dataverse |
| **Dataverse → SFTP** | Dataverse → ADF Extract Pipeline → SQL Staging → ADF Export Pipeline → SFTP file |

Both directions follow the same command flow and documentation standards.

---

## Full Workflow

```
[Unstructured intake]
/spec       → specs/{migration}/spec.md               (migration requirements)

[Structured intake — L1/L2/L3 from ALM tool]
/spec-alm   → specs/{migration}/spec.md               (intake: structured)

/review     → specs/{migration}/review.md             ← APPROVED gate
     ↓
[brownfield mode only]
/impact     → specs/{migration}/impact-analysis.md    ← IMPACT-ASSESSED (required by /plan when brownfield.enabled)
     ↓
[Mixed domain? CE, Power Apps, or integration requirements detected in spec]
/split-spec → specs/{migration}/spec.md (migration-scoped)
             + specs/{migration}-ce/spec.md or specs/{migration}-pa/spec.md (domain agent — if CE/PA FRs exist)
             + specs/{migration}-integration/spec.md (Integration agent — if integration FRs exist)
             + specs/{migration}/split-manifest.md

/mapping    → docs-generated/{migration}/field-mapping.md   (source-to-target field map)
/pipeline   → docs-generated/{migration}/pipeline-design.md (ADF pipeline architecture)
/testplan   → docs-generated/{migration}/test-plan-and-strategy.md
             └─ ALM export ──────────────────────────────────────────────────────────────
               /extract testplan  → alm-extract/test-plan-extract.{csv,json}
               /extract testsuites [suite] → alm-extract/suites-extract.{csv,json}
               /extract testcases [tc-id]  → alm-extract/testcases-extract.{csv,json}
               /alm push-tests → ADO Test Plan + Suites + Cases created
             ─────────────────────────────────────────────────────────────────────────────
     ↓
/plan       → plans/{migration}/plan.md               (technical breakdown)
             + plans/{migration}/work-items.yaml
/clarify    → plans/{migration}/clarify.md            ← TASK-READY gate
     ↓
/tdd        → docs-generated/{migration}/technical-design-document.md
/blueprint  → docs-generated/{migration}/solution-blueprint.md
     ↓
/task       → tasks/{migration}/NN-{name}.md          (dev-ready task cards)
/validate   → updates validation-status on each task card  ← READY TO IMPLEMENT gate
     ↓
/implement  → output/{migration}/adf/                 (ADF JSON definitions)
             output/{migration}/sql/                  (SQL DDL + stored procedures)
             output/{migration}/tests/                (test scripts)
/document   → docs-generated/{migration}/             (deployment guide, runbook, release notes)
```

---

## Command Reference

| Command | Pre-condition | Output |
|---|---|---|
| `/spec {m}` | None | `specs/{m}/spec.md` |
| `/spec-alm {m}` | `requirement-intake: structured` in constitution | `specs/{m}/spec.md` (structured — preserves L1/L2/L3 ALM IDs) |
| `/review {m}` | spec.md exists | `specs/{m}/review.md` |
| `/impact {m}` | review APPROVED + brownfield.enabled | `specs/{m}/impact-analysis.md` |
| `/split-spec {m}` | review APPROVED + mixed domain detected | `specs/{m}/spec.md` (migration-scoped) + domain-scoped spec (CE/PA/FO — if CE/PA FRs exist) + `specs/{m}-integration/spec.md` (if INT FRs exist) + `specs/{m}/split-manifest.md` |
| `/mapping {m}` | review APPROVED | `docs-generated/{m}/field-mapping.md` |
| `/pipeline {m}` | review APPROVED | `docs-generated/{m}/pipeline-design.md` |
| `/testplan {m}` | review APPROVED | `docs-generated/{m}/test-plan-and-strategy.md` |
| `/plan {m}` | review APPROVED | `plans/{m}/plan.md` + `plans/{m}/work-items.yaml` |
| `/clarify {m}` | plan.md exists | `plans/{m}/clarify.md` |
| `/tdd {m}` | clarify TASK-READY | `docs-generated/{m}/technical-design-document.md` |
| `/blueprint {m}` | clarify TASK-READY | `docs-generated/{m}/solution-blueprint.md` |
| `/task {m}` | clarify TASK-READY | `tasks/{m}/NN-{name}.md` |
| `/validate {m}` | TDD + Blueprint exist | updates `validation-status` in each task card |
| `/implement {m}/{task-id}` | validation-status = READY TO IMPLEMENT | `output/{m}/adf/` + `output/{m}/sql/` |
| `/document {m}` | implement complete | `docs-generated/{m}/` (deployment guide, runbook, release notes) |
| `/extract testplan {m}` | testplan exists | `docs-generated/{m}/alm-extract/test-plan-extract.csv` + `.json` + `test-plan-summary.md` |
| `/extract testsuites {m} [suite]` | testplan exists | `docs-generated/{m}/alm-extract/suites-extract.csv` + `.json` + `suites-summary.md` |
| `/extract testcases {m} [tc-id]` | testplan exists | `docs-generated/{m}/alm-extract/testcases-extract.csv` + `.json` + `testcases-detail.md` |
| `/alm push-tests {m}` | extract files exist | ADO Test Plan + Suites + Cases created; `alm-mapping.csv` produced |

---

## Gates

| Gate | Trigger | Blocks |
|---|---|---|
| **APPROVED** | `/review` passes all checks | `/impact` (brownfield), `/split-spec` (mixed domain), `/mapping`, `/pipeline`, `/testplan`, `/plan` |
| **IMPACT-ASSESSED** | `/impact` passes (brownfield only) | `/plan` (when `brownfield.enabled = true`) |
| **TASK-READY** | `/clarify` passes all checks | `/tdd`, `/blueprint`, `/task` |
| **READY TO IMPLEMENT** | `/validate` passes all checks | `/implement` |

---

## Constitution Rules

1. Always read ALL files in `constitution/` before generating any output.
2. The constitution overrides all other instructions.
3. If `../../alm-configuration.md` exists, read it for ADO connection and work item settings — those values take precedence over any duplicates in `constitution/10-alm-configuration.md`.
3. Every generated ADF artifact must conform to `constitution/02-adf-standards.md`.
4. Every SQL artifact must conform to `constitution/03-sql-staging-standards.md`.
5. Every Dataverse interaction must conform to `constitution/04-dataverse-standards.md`.
6. Security controls from `constitution/06-security-standards.md` are non-negotiable.
7. All output paths (`specs/`, `plans/`, `tasks/`, `docs-generated/`, `output/`) are relative to this template's root directory — never relative to the location of the input requirements file, regardless of where the source requirements come from.

---

## Folder Conventions

| Folder | Contents |
|---|---|
| `specs/{migration}/` | Spec, review, impact analysis |
| `plans/{migration}/` | Plan, clarify, work-items.yaml |
| `tasks/{migration}/` | Dev-ready task cards (NN-name.md) |
| `output/{migration}/adf/` | ADF pipeline/dataset/linkedservice JSON |
| `output/{migration}/sql/` | DDL scripts, stored procedures |
| `output/{migration}/tests/` | Test data files, test scripts |
| `docs-generated/{migration}/` | FDD, TDD, mapping, pipeline design, test plan, deployment guide |
| `doc-templates/` | Reusable document templates |

---

## Migration Naming Conventions

- Migration identifier: `{source}-to-{target}-{entity}` e.g. `sftp-to-dv-accounts`, `dv-to-sftp-invoices`
- ADF Pipeline: `PL_{Direction}_{Entity}_{Stage}` e.g. `PL_INGEST_Account_Raw`, `PL_TRANSFORM_Account_Stage`
- ADF Dataset: `DS_{System}_{Entity}_{Format}` e.g. `DS_SFTP_Account_CSV`, `DS_SQL_Account_Stage`
- ADF Linked Service: `LS_{System}_{Environment}` e.g. `LS_SFTP_Prod`, `LS_SQL_Staging_Prod`
- SQL Staging Table: `stg_{entity}_{source}` e.g. `stg_account_sftp`, `stg_invoice_dataverse`
- SQL Error Table: `err_{entity}_{source}` e.g. `err_account_sftp`

---

## MCP Tools Reference

All ADO operations use MCP tools — never use curl or REST calls directly.

### Work Items
| Tool | Purpose |
|---|---|
| `ado_create_work_item` | Create Epic / Feature / User Story / Task / Bug |
| `ado_bulk_create_work_items` | Create multiple work items in one call |
| `ado_get_work_item` | Read a single work item by ID |
| `ado_get_work_items_batch` | Read up to 200 work items by ID list |
| `ado_update_work_item` | Update fields on an existing work item |
| `ado_batch_update_field` | Update one field across many work items |
| `ado_delete_work_item` | Delete (or recycle) a work item |
| `ado_workitem_add_comment` | Add a comment to a work item |
| `ado_workitem_get_comments` | List comments on a work item |
| `ado_workitem_get_history` | Get field revision history |

### Test Plans
| Tool | Purpose |
|---|---|
| `ado_create_test_plan` | Create a new test plan |
| `ado_create_test_suite` | Create a suite under a plan |
| `ado_create_test_case` | Create a test case work item |
| `ado_add_test_case_to_suite` | Link a test case to a suite |
| `ado_get_test_plans` | List all test plans |
| `ado_get_test_suites` | List suites in a plan |
| `ado_get_test_suite_cases` | List test cases in a suite |
| `ado_delete_test_plan` | Delete a test plan |
| `ado_delete_test_suite` | Delete a test suite |

### Wiki
| Tool | Purpose |
|---|---|
| `ado_wiki_list_wikis` | List wikis in the project |
| `ado_wiki_push` | Create or update a wiki page |
| `ado_wiki_pull` | Read a wiki page |
| `ado_wiki_list_pages` | List pages under a path |

### Pipelines
| Tool | Purpose |
|---|---|
| `ado_pipeline_list` | List pipelines (filter by folder) |
| `ado_pipeline_run` | Trigger a pipeline run |
| `ado_pipeline_get_run` | Get run status/result |
| `ado_pipeline_list_runs` | List recent runs for a pipeline |

### Repositories
| Tool | Purpose |
|---|---|
| `ado_repo_list` | List repositories |
| `ado_repo_get` | Get repository details |
| `ado_repo_create_pr` | Create a pull request |
| `ado_repo_get_pr` | Get PR details |
| `ado_workitem_link_to_pr` | Link a work item to a PR |

---

## Startup Check

When the user runs any command:
1. Verify `constitution/10-alm-configuration.md` exists and has valid `org`, `project`, `pat_env_var` values.
2. Verify the MCP server is reachable by calling `ado_get_work_items_batch` with an empty ID list (returns `[]` on success).
3. If either check fails, print a setup warning and continue in degraded mode (generate files only, skip ALM calls).
