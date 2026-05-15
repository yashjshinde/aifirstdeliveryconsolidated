# Task-Readiness Rubric — Data Migration Plan

Use this rubric when running `/clarify {migration-id}` to evaluate the plan.

---

## Completeness Rubric

| # | Check | Pass Condition | Severity |
|---|---|---|---|
| C-01 | All spec entities have ≥1 Feature | Feature exists for every entity in spec | FAIL |
| C-02 | All Features have ≥1 User Story | No empty features | FAIL |
| C-03 | All User Stories have ≥1 Task | No story without implementation tasks | FAIL |
| C-04 | All standard feature groups present | Infrastructure, SQL, ADF, Testing, Deploy, Docs | FAIL |
| C-05 | All tasks have estimate_hours | Non-null, non-zero | FAIL |
| C-06 | Total effort estimate in plan.md | Present | WARN |

## Traceability Rubric

| # | Check | Pass Condition | Severity |
|---|---|---|---|
| TR-01 | All User Stories have acceptance criteria | Non-empty acceptance_criteria in YAML | WARN |
| TR-02 | All Tasks have at least one component tag | From constitution/10 tag list | WARN |
| TR-03 | Open items from mapping/pipeline-design covered | Each open item has a task or is explicitly deferred | WARN |

## Technical Coverage Rubric

| # | Check | Pass Condition | Severity |
|---|---|---|---|
| TC-01 | SQL raw table task exists per entity | Tag: sql:schema | FAIL |
| TC-02 | SQL stage promotion SP task exists | Tag: sql:procedure | FAIL |
| TC-03 | SQL error table task exists | Tag: sql:schema | FAIL |
| TC-04 | ADF ingest or extract pipeline task exists | Tag: adf:pipeline | FAIL |
| TC-05 | ADF transform or export pipeline task exists | Tag: adf:pipeline | FAIL |
| TC-06 | ADF orchestrator pipeline task exists | Tag: adf:pipeline | FAIL |
| TC-07 | ADF notify pipeline task exists | Tag: adf:pipeline | FAIL |
| TC-08 | ADF data flow task exists per entity with mapping | Tag: adf:dataflow | FAIL |
| TC-09 | Trigger configuration task exists | Tag: adf:trigger | FAIL |
| TC-10 | Test data file task exists | Any test: tag | FAIL |
| TC-11 | ARM template + deploy script task exists | Tag: infra: | FAIL |
| TC-12 | Deployment guide task exists | Tag: doc: | WARN |
| TC-13 | Runbook task exists | Tag: doc: | WARN |

## Security Coverage Rubric

| # | Check | Pass Condition | Severity |
|---|---|---|---|
| SC-01 | Key Vault secret setup task per linked service | Tag: infra:keyvault | FAIL |
| SC-02 | Network/firewall task for SFTP IP whitelist | Tag: infra:network | FAIL |
| SC-03 | PII masking task if spec flags PII | Tag present if PII in spec | FAIL |

---

## Decision Matrix

| Outcome | Condition |
|---|---|
| **TASK-READY** | Zero FAIL items |
| **TASK-READY WITH NOTES** | Zero FAILs, one or more WARNs (noted in clarify.md) |
| **CHANGES REQUIRED** | One or more FAILs |
