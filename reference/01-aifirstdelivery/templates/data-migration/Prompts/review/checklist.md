# Review Checklist — Data Migration Specification

Use this checklist when running `/review {migration-id}` to evaluate the spec.

---

## Structure

| # | Check | Severity |
|---|---|---|
| R-01 | All 13 required sections present | FAIL |
| R-02 | Migration direction is a valid value from constitution/01 | FAIL |
| R-03 | Source and target systems both identified | FAIL |
| R-04 | At least one entity/file specified | FAIL |
| R-05 | Data volume and frequency specified | FAIL |
| R-06 | Business justification provided | WARN |
| R-07 | Stakeholder/requestor identified | WARN |
| R-08 | Out of scope section present and non-empty | WARN |

## Technical Quality

| # | Check | Severity |
|---|---|---|
| T-01 | All listed source fields have a data type | FAIL |
| T-02 | Required fields identified for each entity | FAIL |
| T-03 | Data quality rules specified (min one per entity) | FAIL |
| T-04 | Error handling threshold defined | FAIL |
| T-05 | Performance NFR specified (volume + duration) | FAIL |
| T-06 | File format details (encoding, delimiter, header) provided for SFTP sources | FAIL |
| T-07 | Alternate key for Dataverse upsert identified | FAIL |
| T-08 | Delta/incremental filter field specified (for DV→SFTP) | FAIL |
| T-09 | File naming convention documented | WARN |
| T-10 | File archiving behaviour specified | WARN |

## Security

| # | Check | Severity |
|---|---|---|
| S-01 | All fields classified (PII/Sensitive/Internal/Public) | FAIL |
| S-02 | PII fields have masking or encryption requirement | FAIL |
| S-03 | Authentication method specified for each connection | FAIL |
| S-04 | No hardcoded credentials in spec | FAIL |
| S-05 | Key Vault usage confirmed | WARN |
| S-06 | PGP encryption for outbound PII files | WARN |

## Brownfield (only when brownfield.enabled = true)

| # | Check | Severity |
|---|---|---|
| B-01 | Existing data volume estimated | FAIL |
| B-02 | Duplicate detection strategy specified | FAIL |
| B-03 | Existing record treatment documented | FAIL |

---

## Scoring Rules

- Any FAIL → Overall status = **CHANGES REQUIRED**
- All checks pass or only WARNs → **APPROVED** (or **APPROVED WITH COMMENTS** if WARNs present)
- Acknowledged WARNs (user states they accept the risk) → treat as INFO → does not block APPROVED
