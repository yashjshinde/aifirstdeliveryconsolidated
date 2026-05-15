---
migration: {migration-id}
date: {YYYY-MM-DD}
status: DRAFT
direction: {direction}
spec-ref: specs/{migration-id}/spec.md
author: Claude Code (/plan)
---

# Technical Plan — {migration-id}

**Version:** 1.0
**Date:** {today}
**Author:** Data Migration Agent

---

## Table of Contents

1. [Summary](#1-summary)
2. [Epic](#2-epic)
3. [Features and Stories](#3-features-and-stories)
4. [Effort Estimate](#4-effort-estimate)
5. [Implementation Sequence](#5-implementation-sequence)
6. [Risks](#6-risks)
7. [Open Items](#7-open-items)
8. [Document Control](#8-document-control)

---

## 1. Summary

{3–5 sentence summary of the technical approach: direction, entities, pipeline pattern, key design decisions.}

> **AI Notes** — {1–2 sentences: architectural decision or approach trade-off made during decomposition}

---

## 2. Epic

**[E001] [DM] {migration-id} — Full Migration**
**ALM ID:** *(pending)*
**Tags:** `data-migration;{migration-id}`

> **AI Notes** — {1–2 sentences: scope boundary decision for this epic}

---

## 3. Features and Stories

---

### F001 — Infrastructure Setup

**ALM ID:** *(pending)*
**Description:** Key Vault secrets, ADF linked services, SQL database provisioning, and environment parameter files.
**Tags:** `data-migration;infrastructure`

> **AI Notes** — {1–2 sentences: infrastructure scope decision — what is pre-provisioned vs. delivered by this plan}

**User Stories:**

#### US001 — {Story title}

**ALM ID:** *(pending)*
**As a** data engineer **I need** {what} **so that** {why}.
**Story Points:** {N}
**Tags:** `{adf:linkedservice | sql:schema | ...}`

**Acceptance Criteria:**
- {Criterion 1}
- {Criterion 2}

**Tasks:**

| Task ID | Title | Artefact | Estimate | Tags |
|---|---|---|---|---|
| T001 | {Task title} | `output/{migration-id}/adf/linkedServices/{name}.json` | {N}h | `adf:linkedservice` |

---

### F002 — SQL Staging

**ALM ID:** *(pending)*
**Description:** Raw table, stage table, error table, audit table DDL; stage promotion stored procedures.
**Tags:** `data-migration;sql`

> **AI Notes** — {1–2 sentences: staging schema decision — table-per-entity vs shared schema}

**User Stories:**

#### US002 — {Story title}

**ALM ID:** *(pending)*
**As a** data engineer **I need** {what} **so that** {why}.
**Story Points:** {N}

**Acceptance Criteria:**
- {Criterion 1}

**Tasks:**

| Task ID | Title | Artefact | Estimate | Tags |
|---|---|---|---|---|
| T002 | {Task title} | `output/{migration-id}/sql/{name}.sql` | {N}h | `sql:ddl` |

---

### F003 — ADF Datasets

**ALM ID:** *(pending)*
**Description:** Source, staging, and target dataset definitions.
**Tags:** `data-migration;adf`

> **AI Notes** — {1–2 sentences: dataset parameterisation decision}

---

### F004 — ADF Pipelines

**ALM ID:** *(pending)*
**Description:** Ingest, transform, notify, and orchestrator pipeline definitions.
**Tags:** `data-migration;adf`

> **AI Notes** — {1–2 sentences: pipeline pattern choice — orchestrator vs. direct execution}

---

### F005 — ADF Data Flows

**ALM ID:** *(pending)*
**Description:** Mapping data flows for field transformation and type casting.
**Tags:** `data-migration;adf`

> **AI Notes** — {1–2 sentences: data flow complexity assessment from field mapping}

---

### F006 — ADF Triggers

**ALM ID:** *(pending)*
**Description:** Schedule and/or storage event triggers.
**Tags:** `data-migration;adf`

---

### F007 — Test Data

**ALM ID:** *(pending)*
**Description:** Test CSV/JSON files and SQL seed data covering happy path and edge cases.
**Tags:** `data-migration;testing`

> **AI Notes** — {1–2 sentences: test scenario coverage decision}

---

### F008 — Deployment

**ALM ID:** *(pending)*
**Description:** ARM template export, deploy.ps1, and environment parameter files for DEV / UAT / PROD.
**Tags:** `data-migration;deployment`

---

### F009 — Documentation

**ALM ID:** *(pending)*
**Description:** Deployment guide, runbook, and release notes.
**Tags:** `data-migration;documentation`

---

*(Add or remove features as applicable to this migration)*

---

## 4. Effort Estimate

| Component | Stories | Tasks | Hours |
|---|---|---|---|
| Infrastructure Setup | {N} | {N} | {N}h |
| SQL Staging | {N} | {N} | {N}h |
| ADF Datasets | {N} | {N} | {N}h |
| ADF Pipelines | {N} | {N} | {N}h |
| ADF Data Flows | {N} | {N} | {N}h |
| ADF Triggers | {N} | {N} | {N}h |
| Test Data | {N} | {N} | {N}h |
| Deployment | {N} | {N} | {N}h |
| Documentation | {N} | {N} | {N}h |
| **Total** | **{N}** | **{N}** | **{N}h** |

---

## 5. Implementation Sequence

Deliver in this order to respect dependency constraints:

1. **SQL schema and tables** — raw → stage → error → audit (before pipelines reference them)
2. **SQL stored procedures** — promotion and validation SPs
3. **ADF Linked Services** — before datasets reference them
4. **ADF Datasets** — source → staging → target
5. **ADF Data Flows** — after datasets are defined
6. **ADF Pipelines** — Notify → Ingest/Extract → Transform/Export → Orchestrator
7. **ADF Triggers** — after pipelines are validated
8. **Test data files and scripts**
9. **ARM template and deploy script**
10. **Documentation**

---

## 6. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| {risk} | H / M / L | H / M / L | {action} |

---

## 7. Open Items

| # | Item | Owner | Due |
|---|---|---|---|
| 1 | {open question or decision} | {owner} | {date} |

---

## 8. Document Control

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | {YYYY-MM-DD} | Claude Code (/plan) | Initial plan generated from spec v{n} |
