---
description: Pull work items / test cases from ADO or JIRA into local; supports 3 sourcing modes via --read-only-levels
agent: alm
phase: ALM
gates: []
---

# /alm pull

> Pull ALM state into `work-items.yaml` + `traceability.yaml`. The `--read-only-levels` flag locks specific tiers so downstream agents cannot modify them — gives Options 1 / 2 / 3 from [design/agents/alm.md](../../../design/agents/alm.md).

## Usage

```
/alm pull <artifact> [--overwrite|--fail-on-conflict] [--scope plan|suite|case] [--plan-id <id>] [--levels L1,L2,L3] [--read-only-levels L1,L2] [--dry-run] [--feature <f>] [--suite <slug>] [--project <name>]
```

`<artifact>`: `work-items` | `tests` | `wiki`

## Three sourcing modes

| Mode | When | Flags |
|---|---|---|
| **Option 1**: L1+L2+L3 from ALM, all locked | Product team owns the full hierarchy in ALM | `--levels L1,L2,L3 --read-only-levels L1,L2,L3` |
| **Option 2**: L1+L2 from ALM (locked), L3+ optional locally | Product owns Epic/Feature; engineers add Stories | `--levels L1,L2,L3 --read-only-levels L1,L2` |
| **Option 3**: L2+ from ALM (L2 locked), L3+ optional | Product owns Feature; engineers add Stories | `--levels L2,L3 --read-only-levels L2` |

`read-only-levels` are validated against during `/plan` in each domain agent — agents refuse to create / modify items at those tiers.

## Conflict resolution flags

| Flag | Effect |
|---|---|
| `--overwrite` (default for pull) | ALM is the source of truth; local versions of pulled items get replaced |
| `--fail-on-conflict` | Abort if local has uncommitted changes against the pulled items |

## Inputs

- `project.config.yaml alm.*`
- `projects/{p}/work-items.yaml` (existing local state for diff)
- `projects/{p}/{agent}/features/{f}/traceability.yaml`
- [`templates/alm-pull-report.template.md`](../../templates/alm-pull-report.template.md)

## Execution flow

1. Resolve project + alm.tool.
2. Resolve scope:
   - `--feature` → filter to one feature's L1 + descendants
   - `--plan-id` (tests) → filter to one test plan's suites + cases
   - `--suite` (tests) → filter to one suite's cases
3. Query ALM (MCP `alm_query`) using the canonical query language abstracted by adapter:
   - ADO: WIQL `SELECT [System.Id], [...] FROM workItems WHERE Tag CONTAINS 'feature:{f}'`
   - JIRA: JQL `project = PROJ AND labels = "feature:{f}"`
4. For each returned work item:
   - Convert ALM body fields → markdown via `alm_convert_alm_to_md`
   - Extract Mermaid source from preserved `<pre><code class="mermaid">` blocks (lossless)
   - Map ALM type to local tier per `alm.hierarchy` in `project.config.yaml`
   - Read `Custom.LocalUID` (ADO) / `customfield_local_uid` (JIRA) — when present, match against local; when absent, generate a new `localUID` and tag the ALM item (round-trip)
5. For each test case + steps:
   - Convert Steps XML (ADO) / test-tool fields (JIRA) → markdown numbered step list
   - Insert into per-feature `test-plan/{suite}.suite.md`
6. Diff against local:
   - Items in ALM not in local → CREATE (write to `work-items.yaml`)
   - Items in both → COMPARE
     - On `--overwrite` (default): write ALM version, mark `pulledHash` updated, log local-override diff for audit
     - On `--fail-on-conflict`: abort if local hash != `pushedHash`
   - Items in local not in ALM → KEEP locally; flag as `not-yet-pushed` in report
7. Update `traceability.yaml` with current ALM hashes + timestamps.
8. On `--dry-run`: render report only, no local writes.
9. Persist `read-only-levels` constraint into `projects/{p}/work-items.yaml metadata.read-only-levels`.
10. Render `alm-reports/pull-{ts}.md`.

## Output

- `projects/{p}/work-items.yaml` — updated (ALM-pulled items added / replaced; `localUID`s stable)
- `projects/{p}/{agent}/features/{f}/traceability.yaml` — updated
- `projects/{p}/alm-reports/pull-{ts}.md` — full report

## See also

- [constitution/01-alm-mapping.md](../../constitution/01-alm-mapping.md)
- [templates/alm-pull-report.template.md](../../templates/alm-pull-report.template.md)
- [design/agents/alm.md § Options 1/2/3](../../../design/agents/alm.md)
