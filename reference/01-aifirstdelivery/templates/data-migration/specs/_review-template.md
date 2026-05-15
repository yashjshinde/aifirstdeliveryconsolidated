---
migration: {migration-id}
date: {YYYY-MM-DD}
status: DRAFT | CHANGES REQUIRED | APPROVED | APPROVED WITH COMMENTS
reviewed-by: Claude Code (/review)
---

# Spec Review — {migration-id}

## Document Control

| Field | Value |
|---|---|
| Migration ID | {migration-id} |
| Reviewed By | Claude Code (/review) |
| Review Date | {YYYY-MM-DD} |
| Status | {DRAFT \| CHANGES REQUIRED \| APPROVED \| APPROVED WITH COMMENTS} |
| Version | 1.0 |

---

## Table of Contents

- [Verdict](#verdict)
- [Structure Checks](#structure-checks)
- [Technical Quality Checks](#technical-quality-checks)
- [Security Checks](#security-checks)
- [Brownfield Checks](#brownfield-checks)
- [Constitution Violations (BLOCKER)](#constitution-violations-blocker)
- [Missing Information (REQUIRED)](#missing-information-required)
- [Best Practice Gaps (RECOMMENDED)](#best-practice-gaps-recommended)
- [Clarification Questions (QUESTION)](#clarification-questions-question)
- [Summary](#summary)

---

## Verdict

**Status: {DRAFT | CHANGES REQUIRED | APPROVED | APPROVED WITH COMMENTS}**

> APPROVED = all FAIL checks pass, zero BLOCKERs, zero REQUIREDs.
> APPROVED WITH COMMENTS = all FAILs pass, only acknowledged WARNs remain.
> CHANGES REQUIRED = one or more FAIL checks not met, or BLOCKER present.

---

## Structure Checks

| # | Check | Result | Notes |
|---|---|---|---|
| R-01 | All 13 required sections present | PASS / FAIL | |
| R-02 | Migration direction is a valid value from constitution/01 | PASS / FAIL | |
| R-03 | Source and target systems both identified | PASS / FAIL | |
| R-04 | At least one entity/file specified | PASS / FAIL | |
| R-05 | Data volume and frequency specified | PASS / FAIL | |
| R-06 | Business justification provided | PASS / WARN | |
| R-07 | Stakeholder/requestor identified | PASS / WARN | |
| R-08 | Out of scope section present and non-empty | PASS / WARN | |

---

## Technical Quality Checks

| # | Check | Result | Notes |
|---|---|---|---|
| T-01 | All listed source fields have a data type | PASS / FAIL | |
| T-02 | Required fields identified for each entity | PASS / FAIL | |
| T-03 | Data quality rules specified (min one per entity) | PASS / FAIL | |
| T-04 | Error handling threshold defined | PASS / FAIL | |
| T-05 | Performance NFR specified (volume + duration) | PASS / FAIL | |
| T-06 | File format details (encoding, delimiter, header) provided for SFTP sources | PASS / FAIL | |
| T-07 | Alternate key for Dataverse upsert identified | PASS / FAIL | |
| T-08 | Delta/incremental filter field specified (for DV→SFTP) | PASS / FAIL | |
| T-09 | File naming convention documented | PASS / WARN | |
| T-10 | File archiving behaviour specified | PASS / WARN | |

---

## Security Checks

| # | Check | Result | Notes |
|---|---|---|---|
| S-01 | All fields classified (PII/Sensitive/Internal/Public) | PASS / FAIL | |
| S-02 | PII fields have masking or encryption requirement | PASS / FAIL | |
| S-03 | Authentication method specified for each connection | PASS / FAIL | |
| S-04 | No hardcoded credentials in spec | PASS / FAIL | |
| S-05 | Key Vault usage confirmed | PASS / WARN | |
| S-06 | PGP encryption for outbound PII files | PASS / WARN | |

---

## Brownfield Checks

> Only evaluated when `brownfield.enabled = true` in constitution/10-alm-configuration.md.

| # | Check | Result | Notes |
|---|---|---|---|
| B-01 | Existing data volume estimated | PASS / FAIL / N/A | |
| B-02 | Duplicate detection strategy specified | PASS / FAIL / N/A | |
| B-03 | Existing record treatment documented | PASS / FAIL / N/A | |

---

## Constitution Violations (BLOCKER)

> Must be resolved before /mapping, /pipeline, /plan can proceed.

| ID | Constitution Rule | Spec Section | Issue | Required Action |
|---|---|---|---|---|
| BL-001 | {Rule ref} | §{N} | {What violates the rule} | {What must change} |

*(none — if no blockers)*

---

## Missing Information (REQUIRED)

> The mapping and plan cannot be written without this information.

| ID | Gap | Spec Section | Why It Blocks Planning |
|---|---|---|---|
| RQ-001 | {Missing detail} | §{N} | {Why a technical decision cannot be made without it} |

*(none — if no required gaps)*

---

## Best Practice Gaps (RECOMMENDED)

> Should be addressed but does not block planning.

| ID | Recommendation | Spec Section | Rationale |
|---|---|---|---|
| RC-001 | {Recommendation} | §{N} | {Why this matters} |

---

## Clarification Questions (QUESTION)

> Needs business input — does not block planning but may affect implementation.

| ID | Question | Spec Section | Impact if Unresolved |
|---|---|---|---|
| QS-001 | {Question} | §{N} | {What gets assumed if not answered} |

---

## Summary

| Category | Count |
|---|---|
| FAIL checks not met | {n} |
| BLOCKER | {n} |
| REQUIRED | {n} |
| RECOMMENDED | {n} |
| QUESTION | {n} |
| WARN (acknowledged) | {n} |
