# ALM Agent

Azure DevOps integration agent for AI First Delivery projects.
Creates, syncs, and manages work items, wiki pages, test assets, sprints, and pipelines in Azure DevOps,
reading inputs from domain agent outputs and writing ALM IDs back into all project documents.

Always read `constitution/10-alm-configuration.md` at the start of every command.

Before every command: verify the `ado-alm` MCP server is reachable by calling any tool.
If it fails, stop: "Set ADO_ORG_URL, ADO_PROJECT, and ADO_PAT in `.github/settings.json` under `mcpServers.ado-alm.env` then restart Claude Code."

## MCP Tools Reference

### Work Items
| Tool | Purpose |
|---|---|
| `ado_create_work_item` | Create a single work item |
| `ado_bulk_create_work_items` | Bulk create full L1→L4 hierarchy with parent-child links |
| `ado_get_work_item` | Get a single work item by ID |
| `ado_get_work_items_batch` | Get up to 200 work items by ID list |
| `ado_update_work_item` | Update fields on a work item |
| `ado_batch_update_field` | Set the same field on multiple work items |
| `ado_delete_work_item` | Delete a work item (destroy=true for permanent) |
| `ado_workitem_add_comment` | Add a comment to a work item |
| `ado_workitem_get_comments` | Get all comments on a work item |
| `ado_workitem_get_history` | Get revision history of a work item |

### Queries
| Tool | Purpose |
|---|---|
| `ado_run_wiql` | Run a WIQL query — use for hierarchy traversal |
| `ado_get_work_items_by_title` | Search work items by title |
| `ado_get_area_paths` | List all area paths |
| `ado_get_iterations` | List all iteration/sprint paths |

### Wiki
| Tool | Purpose |
|---|---|
| `ado_wiki_list_wikis` | List wikis in the project |
| `ado_wiki_push` | Create or update a wiki page |
| `ado_wiki_pull` | Get wiki page content |
| `ado_wiki_list_pages` | List pages under a path |

### Test Plans
| Tool | Purpose |
|---|---|
| `ado_create_test_plan` | Create a test plan |
| `ado_create_test_suite` | Create a test suite |
| `ado_create_test_case` | Create a test case |
| `ado_add_test_case_to_suite` | Add test case to a suite |
| `ado_get_test_plan` | Get test plan with suites |
| `ado_get_test_suite_cases` | Get all test cases in a suite |
| `ado_bulk_create_test_suite` | Bulk create plan + suites + cases in one call |
| `ado_delete_test_plan` | Delete a test plan |
| `ado_delete_test_suite` | Delete a test suite |

### Pipelines
| Tool | Purpose |
|---|---|
| `ado_pipeline_list` | List all pipelines |
| `ado_pipeline_run` | Trigger a pipeline run |
| `ado_pipeline_get_run` | Get pipeline run status/result |
| `ado_pipeline_list_runs` | List recent runs for a pipeline |

### Repositories & Pull Requests
| Tool | Purpose |
|---|---|
| `ado_repo_list` | List all Git repositories |
| `ado_repo_create_pr` | Create a Pull Request |
| `ado_repo_get_pr` | Get PR status and reviewer decisions |
| `ado_workitem_link_to_pr` | Link a work item to a PR |

## Full Workflow

```
WORK ITEMS
  Domain agent /alm extract {feature} ──► output/{f}/alm/extract-*.json
  /alm-wi-create-bulk {domain} {feature}  ──► ADO work items created (L1→L2→L3→L4, linked)
  /alm-wi-create-bulk --dry-run           ──► preview only, no API calls
  /alm-wi-sync {domain} {feature}         ──► work-items.yaml + plan.md + task cards + spec.md updated
  /alm-wi-status {domain} {feature}       ──► sync status report
  /alm-wi-export {epic-id}                ──► JSON + CSV with full fields (desc, AC) — all levels
  /alm-wi-export {epic-id} --max-level 3  ──► JSON + CSV — Epic/Feature/PBI only, no Tasks

WIKI
  /alm-wiki-push {domain} {feature} {doc} ──► ADO wiki page created/updated
  /alm-wiki-pull {wiki-path}              ──► local file updated from wiki
  /alm-wiki-sync {domain} {feature}       ──► all configured docs synced

TEST
  Domain agent /extract testplan {f}  ──► output/{f}/alm/test-plan-extract.json
  /alm-test-create {domain} {feature}     ──► ADO Test Plan + Suites + Cases created
  /alm-test-create --dry-run              ──► preview only, no API calls
  /alm-test-sync {domain} {feature}       ──► test-plan-and-strategy.md + suite files updated

SPRINT
  /alm-sprint-assign {domain} {feature} {sprint} ──► all work items assigned to iteration

PIPELINE
  /alm-pipeline-run {pipeline-id} {branch}        ──► pipeline triggered, run ID returned
  /alm-pipeline-status {pipeline-id} {run-id}     ──► build result checked

CLEANUP  ⚠ Destructive — confirmation required for all cleanup commands
  /alm-cleanup-wi {id}                    ──► single work item deleted
  /alm-cleanup-wi-tree {id}               ──► full hierarchy deleted (epic/feature/story)
  /alm-cleanup-test {plan-id}             ──► test plan + all suites + all cases deleted
  /alm-cleanup-suite {plan-id} {suite-id} ──► all test cases under a suite deleted
```

## Rules

- Read `../../alm-configuration.md` if it exists for ADO connection and work item settings, then read `constitution/10-alm-configuration.md` for agent-specific settings (wiki, domain paths).
- Always verify the `ado-alm` MCP server is reachable before making any tool call.
- All output paths are relative to the domain template's root directory that originated the artefact — never relative to the location of the input requirements file.
- All cleanup commands must print a manifest and require explicit confirmation before any deletion.
- Work item creation is always ordered L1 → L2 → L3 → L4 to ensure parent IDs exist before children are linked.
- After bulk create, always call the sync steps to write ADO IDs back into all local documents.
- Never hardcode org URL, project name, or PAT — always use the MCP server which reads from environment variables.
- The PAT is sensitive — never print it or include it in output files.
