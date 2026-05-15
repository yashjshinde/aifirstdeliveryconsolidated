Push a single local document to an Azure DevOps Wiki page (create or update).

## Usage

```
/wiki-push {domain} {feature} {doc}
```

Where `{doc}` is any supported doc key — see the path resolution table below.

## Steps

### 1. Load configuration

Read `constitution/10-alm-configuration.md` — load: `wiki-root`, all `sync-*` toggles, domain paths.

### 2. Check toggle

Look up `sync-{doc}` in configuration. If `false`: stop with "Sync for {doc} is disabled in constitution/10-alm-configuration.md."

### 3. Determine path scheme for the domain

| Domain | Path scheme |
|---|---|
| `d365-ce` | standard |
| `integration` | standard |
| `power-apps` | standard |
| `reporting` | standard |
| `data-migration` | standard |
| `d365-fo` | fo |
| `solution-architect` | architect |
| `solution-estimate` | estimate |

### 4. Resolve the local file path

#### Universal documents

| Doc key | Path (standard) | Path (fo) |
|---|---|---|
| `spec` | `specs/{f}/spec.md` | `specs/{f}/spec.md` |
| `fdd` | `docs-generated/{f}/functional-design-document.md` | `docs/{f}/fdd.md` |
| `tdd` | `docs-generated/{f}/technical-design-document.md` | `docs/{f}/tdd.md` |
| `blueprint` | `docs-generated/{f}/solution-blueprint.md` | — |
| `testplan` | `docs-generated/{f}/test-plan-and-strategy.md` | `docs/{f}/test-plan.md` |
| `plan` | `plans/{f}/plan.md` | `plans/{f}/plan.md` |
| `review` | `specs/{f}/review.md` | `specs/{f}/review.md` |
| `clarify` | `plans/{f}/clarify.md` | — |
| `fdd-review` | `docs-generated/{f}/fdd-review.md` | `docs/{f}/fdd-review.md` |
| `tdd-review` | `docs-generated/{f}/tdd-review.md` | `docs/{f}/tdd-review.md` |
| `deployment-guide` | `docs-generated/{f}/deployment-guide.md` | `docs/{f}/deployment-guide.md` |
| `release-notes` | `docs-generated/{f}/release-notes.md` | `docs/{f}/release-notes.md` |
| `runbook` | `docs-generated/{f}/runbook.md` | — |

#### Domain-specific documents

| Doc key | Local path | Domain |
|---|---|---|
| `mapping` | `docs-generated/{f}/field-mapping.md` | data-migration |
| `pipeline-design` | `docs-generated/{f}/pipeline-design.md` | data-migration |
| `api-contract` | `docs-generated/{f}/api-contract.md` | integration |
| `message-schema` | `docs-generated/{f}/message-schema.md` | integration |
| `app-design` | `docs-generated/{f}/app-design.md` | power-apps |
| `data-dictionary` | `docs-generated/{f}/data-dictionary.md` | reporting |
| `asset-registry` | `docs-generated/{f}/asset-registry.md` | reporting |
| `object-register` | `docs/{f}/object-register.md` | d365-fo |
| `test-evidence` | `docs/{f}/test-evidence-summary.md` | d365-fo |

#### Solution-level documents

| Doc key | Local path | Domain |
|---|---|---|
| `solution-blueprint` | `output/{f}/solution-blueprint.md` | solution-architect |
| `solution-review` | `output/{f}/solution-review.md` | solution-architect |
| `rom-estimate` | `estimates/{f}/rom-estimate.md` | solution-estimate |
| `business-req-detail` | `estimates/{f}/business-req-detail.md` | solution-estimate |
| `module-build-hrs` | `estimates/{f}/module-build-hrs.md` | solution-estimate |
| `module-overall-hrs` | `estimates/{f}/module-overall-hrs.md` | solution-estimate |
| `rollup-summary` | `estimates/{f}/rollup-summary.md` | solution-estimate |

Resolve full local path: `{domain-path}/{resolved-path}` where `{f}` = `{feature}`.

### 5. Read and push

Read the local file. If it does not exist: stop with "File not found: {path}."

Call MCP tool `ado_wiki_push`:
- `path`: `{wiki-root}/{feature}/{doc}`
- `content`: full file content
- `comment`: `Synced from {domain}/{feature} by ALM Agent`

### 6. Print

```
WIKI PUSH — {doc}
═════════════════════════════════
Domain     : {domain}
Feature    : {feature}
Local file : {local-path}
Wiki path  : {wiki-root}/{feature}/{doc}
Action     : {Created | Updated}
URL        : {url}
```
