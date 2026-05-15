# ALM Agent — Constitution Index

| File | Purpose |
|---|---|
| `10-alm-configuration.md` | Azure DevOps connection settings, area paths, work item types, wiki config, domain paths |
| `CLAUDE.md` | Agent rules, full workflow, MCP tools reference, and command reference |

## How This Agent Works

This agent bridges local AI First Delivery project documents with Azure DevOps.
It reads structured outputs from domain agents and pushes them to ADO, then writes the ADO-assigned IDs back into all source documents.

It does not generate requirements, specs, or designs — those come from the domain agents.

## Workflow

```
WORK ITEMS
  Domain agent (/alm extract) → output/{f}/alm/extract-*.json
                                      ↓
                    /wi-create-bulk {domain} {feature}   → ADO Work Items (L1→L2→L3→L4)
                                      ↓
                    /wi-sync {domain} {feature}          → writes IDs back to all documents

TEST PLANS
  Domain agent (/extract testplan) → output/{f}/alm/test-plan-extract.json
                                      ↓
                    /test-create {domain} {feature}      → ADO Test Plan + Suites + Cases
                                      ↓
                    /test-sync {domain} {feature}        → writes TC IDs back to test files

WIKI
                    /wiki-sync {domain} {feature}        → pushes all enabled docs to ADO wiki

SPRINT / PIPELINE / CLEANUP — see CLAUDE.md for full command reference
```
