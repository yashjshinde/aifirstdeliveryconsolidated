---
mode: agent
description: "Sync all configured documents for a domain feature to Azure DevOps Wiki in one pass. Triggers on: 'sync wiki', 'push all docs to wiki', 'wiki-sync'."
---

Sync all configured documents for a domain feature to Azure DevOps Wiki.

## Usage

```
/alm-wiki-sync {domain} {feature}
```

## Steps

### 1. Load configuration

Read `constitution/10-alm-configuration.md` — load: `wiki-root`, all `sync-*` toggles, domain paths.

### 2. Determine path scheme for the domain

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

Path roots per scheme (relative to `{domain-path}`):

| Scheme | docs root | specs root | plans root |
|---|---|---|---|
| standard | `docs-generated/{feature}/` | `specs/{feature}/` | `plans/{feature}/` |
| fo | `docs/{feature}/` | `specs/{feature}/` | `plans/{feature}/` |
| architect | `output/{feature}/` | — | — |
| estimate | `estimates/{feature}/` | — | — |

### 3. Build the enabled document list

Evaluate each toggle. For each row: if the toggle is `true` **and** the domain column is ✓, include it.

#### Universal documents (most domains)

| Toggle | Doc key | Path (standard) | Path (fo) | d365-ce | integration | power-apps | reporting | data-migration | d365-fo |
|---|---|---|---|---|---|---|---|---|---|
| `sync-spec` | spec | `specs/{f}/spec.md` | `specs/{f}/spec.md` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `sync-fdd` | fdd | `docs-generated/{f}/functional-design-document.md` | `docs/{f}/fdd.md` | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| `sync-tdd` | tdd | `docs-generated/{f}/technical-design-document.md` | `docs/{f}/tdd.md` | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| `sync-blueprint` | blueprint | `docs-generated/{f}/solution-blueprint.md` | — | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| `sync-testplan` | testplan | `docs-generated/{f}/test-plan-and-strategy.md` | `docs/{f}/test-plan.md` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `sync-plan` | plan | `plans/{f}/plan.md` | `plans/{f}/plan.md` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `sync-review` | review | `specs/{f}/review.md` | `specs/{f}/review.md` | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| `sync-clarify` | clarify | `plans/{f}/clarify.md` | — | ✓ | ✓ | ✓ | — | ✓ | — |
| `sync-fdd-review` | fdd-review | `docs-generated/{f}/fdd-review.md` | `docs/{f}/fdd-review.md` | — | ✓ | ✓ | — | — | ✓ |
| `sync-tdd-review` | tdd-review | `docs-generated/{f}/tdd-review.md` | `docs/{f}/tdd-review.md` | ✓ | — | — | — | — | ✓ |
| `sync-deployment-guide` | deployment-guide | `docs-generated/{f}/deployment-guide.md` | `docs/{f}/deployment-guide.md` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `sync-release-notes` | release-notes | `docs-generated/{f}/release-notes.md` | `docs/{f}/release-notes.md` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `sync-runbook` | runbook | `docs-generated/{f}/runbook.md` | — | — | ✓ | — | — | ✓ | — |

#### Domain-specific documents

| Toggle | Doc key | Local path | Domain only |
|---|---|---|---|
| `sync-mapping` | mapping | `docs-generated/{f}/field-mapping.md` | data-migration |
| `sync-pipeline-design` | pipeline-design | `docs-generated/{f}/pipeline-design.md` | data-migration |
| `sync-api-contract` | api-contract | `docs-generated/{f}/api-contract.md` | integration |
| `sync-message-schema` | message-schema | `docs-generated/{f}/message-schema.md` | integration |
| `sync-app-design` | app-design | `docs-generated/{f}/app-design.md` | power-apps |
| `sync-data-dictionary` | data-dictionary | `docs-generated/{f}/data-dictionary.md` | reporting |
| `sync-asset-registry` | asset-registry | `docs-generated/{f}/asset-registry.md` | reporting |
| `sync-object-register` | object-register | `docs/{f}/object-register.md` | d365-fo |
| `sync-test-evidence` | test-evidence | `docs/{f}/test-evidence-summary.md` | d365-fo |

#### Solution-level documents (solution-architect and solution-estimate only)

| Toggle | Doc key | Local path | Domain only |
|---|---|---|---|
| `sync-solution-blueprint` | solution-blueprint | `output/{f}/solution-blueprint.md` | solution-architect |
| `sync-solution-review` | solution-review | `output/{f}/solution-review.md` | solution-architect |
| `sync-rom-estimate` | rom-estimate | `estimates/{f}/rom-estimate.md` | solution-estimate |
| `sync-estimate-build` | business-req-detail | `estimates/{f}/business-req-detail.md` | solution-estimate |
| `sync-estimate-build` | module-build-hrs | `estimates/{f}/module-build-hrs.md` | solution-estimate |
| `sync-estimate-build` | module-overall-hrs | `estimates/{f}/module-overall-hrs.md` | solution-estimate |
| `sync-estimate-build` | rollup-summary | `estimates/{f}/rollup-summary.md` | solution-estimate |

> For `sync-estimate-build`, push all four files if the toggle is true — each becomes its own wiki page.

### 4. Push each document

For each document in the enabled list:
   a. Resolve the full local path: `{domain-path}/{resolved-path}` where `{f}` = `{feature}`.
   b. Check if the local file exists. If not: record `SKIPPED (file not found)` and continue.
   c. Call MCP tool `ado_wiki_push`:
      - `path`: `{wiki-root}/{feature}/{doc-key}`
      - `content`: full file content
      - `comment`: `Synced from {domain}/{feature} by ALM Agent`
   d. Record: `OK`, `SKIPPED`, or `FAILED: {error}`.

### 5. Print summary

```
WIKI SYNC — {feature}
══════════════════════════════════════
Domain  : {domain}
Feature : {feature}

  spec             → {wiki-root}/{feature}/spec             OK ✓
  fdd              → {wiki-root}/{feature}/fdd              OK ✓
  tdd              → {wiki-root}/{feature}/tdd              OK ✓
  blueprint        → {wiki-root}/{feature}/blueprint        OK ✓
  testplan         → {wiki-root}/{feature}/testplan         OK ✓
  plan             → {wiki-root}/{feature}/plan             disabled
  review           → {wiki-root}/{feature}/review           OK ✓
  clarify          → {wiki-root}/{feature}/clarify          SKIPPED (file not found)
  deployment-guide → {wiki-root}/{feature}/deployment-guide OK ✓
  release-notes    → {wiki-root}/{feature}/release-notes    OK ✓
  api-contract     → {wiki-root}/{feature}/api-contract     OK ✓   [integration only]

Completed: {N} pushed  {N} skipped  {N} failed
```
