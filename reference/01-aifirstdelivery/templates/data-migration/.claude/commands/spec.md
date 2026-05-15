Write the Migration Specification for a data migration or integration scenario.

## Usage

```
/spec {migration-id}
```

`{migration-id}` — short identifier e.g. `sftp-accounts`, `dv-to-sftp-invoices`, `erp-customers`

## Steps

1. Read ALL files in `constitution/`.
2. Determine the migration direction from the user's description or from `constitution/10-alm-configuration.md`.
3. Ask clarifying questions ONLY if the user has not provided enough information to determine direction, source, target, and at least one entity.
4. Generate `specs/{migration-id}/spec.md` using `doc-templates/spec-template.md`.

## spec.md Required Sections

### Header

```markdown
# Migration Specification — {migration-id}

**Version:** 1.0
**Date:** {today}
**Author:** Data Migration Agent
**Status:** DRAFT

---
```

### Section 1 — Overview

| Field | Value |
|---|---|
| Migration ID | {migration-id} |
| Direction | {SFTP_TO_DATAVERSE \| DATAVERSE_TO_SFTP \| ...} |
| Source System | {name, type, owner} |
| Target System | {name, type, owner} |
| Entities / Files | {list} |
| Estimated Volume | {records or file size per run} |
| Frequency | {one-time \| daily \| hourly \| event-triggered} |
| Priority | {High \| Medium \| Low} |
| Requested By | {stakeholder} |

### Section 2 — Business Justification

Why this migration is needed. Reference the business process it supports.

### Section 3 — Source System Description

- System name and owner
- Connection type: SFTP / SQL / REST API / Dataverse
- Authentication method
- File format (if SFTP): CSV / JSON / XML, encoding, delimiter
- Available fields (list all source columns / entity fields)
- Data quality concerns (known issues: nulls, encoding problems, date formats)

### Section 4 — Target System Description

- System name and owner
- Connection type
- Entities / tables / files to be written
- Target authentication method
- Existing data: is there existing data that could conflict?

### Section 5 — Staging Requirements

- SQL staging database to be used
- New tables needed vs reusing existing
- Retention period for staging data

### Section 6 — Data Volume and Frequency

| Entity | Estimated Records | File Size | Frequency | Window |
|---|---|---|---|---|
| {entity} | {N} | {size} | {cron / event} | {time window} |

### Section 7 — Field Scope

**Included fields:** List all source fields that must be migrated.
**Excluded fields:** List any source fields explicitly out of scope with reason.

### Section 8 — Data Quality Rules

For each entity, list:
- Required fields (must not be null/empty)
- Format constraints (date patterns, code values, max lengths)
- Business rules (e.g. amount must be positive, status must be in approved list)
- Lookup dependencies (source code must exist in reference table)

### Section 9 — Error Handling Requirements

- Threshold for acceptable error rate (e.g. < 5% of records may fail)
- What happens when threshold is exceeded (stop or continue)
- Notification requirements (who gets alerted, via what channel)
- Error file delivery (back to source, into error SFTP folder, etc.)

### Section 10 — Security and Compliance Requirements

- Data classification of migrated fields (PII, Sensitive, Internal, Public)
- Encryption requirements (PGP for outbound, TLS for in-transit)
- Data residency requirements
- Audit / logging requirements
- Masking requirements for non-production

### Section 11 — Non-Functional Requirements

| NFR | Requirement |
|---|---|
| Performance | Process {N} records in < {duration} |
| Availability | Pipeline must complete in window {HH:MM}–{HH:MM} |
| Retry | Max {N} retries before alerting |
| Data Retention | Staging data retained for {N} days |
| Recovery | RTO {duration}, RPO {duration} |

### Section 12 — Dependencies and Pre-conditions

- [ ] Source system accessible from ADF (network, credentials)
- [ ] Target entity / table exists with required fields
- [ ] SQL Staging database provisioned
- [ ] Key Vault configured with required secrets
- [ ] ADF linked services created and tested
- [ ] {any custom dependencies}

### Section 13 — Out of Scope

Explicitly list what is NOT part of this migration.

---

## Rules

- Do not invent requirements — only document what was stated or directly inferrable from the source.
- **AI Notes:** At the end of each major section and each individual migration requirement block (MR-NNN), append `> **AI Notes** — {1–2 sentences: decision made, inference drawn, assumption taken, or risk flagged}`. Write only what is non-obvious — never summarise the section content.
- Write the output to `specs/{migration-id}/spec.md` relative to **this template's root directory** — never relative to the location of the input requirements file, regardless of where the source requirements originate.

---

## Output

Write the file to `specs/{migration-id}/spec.md`.

Print:

```
SPEC WRITTEN — {migration-id}
════════════════════════════════════════
File     : specs/{migration-id}/spec.md
Direction: {direction}
Entities : {list}
Sections : 13

Next step: /review {migration-id}
```
