# Migration Specification — {migration-id}

**Version:** 1.0
**Date:** {date}
**Author:** Data Migration Agent
**Status:** DRAFT

---

## 1. Overview

| Field | Value |
|---|---|
| Migration ID | {migration-id} |
| Direction | {SFTP_TO_DATAVERSE \| DATAVERSE_TO_SFTP \| SQL_TO_DATAVERSE \| DATAVERSE_TO_SQL} |
| Source System | {name} — {type: SFTP / SQL / Dataverse / REST} |
| Target System | {name} — {type} |
| Entities / Files | {list} |
| Estimated Volume | {N records or file size per run} |
| Frequency | {one-time \| daily \| hourly \| event-triggered} |
| Priority | {High \| Medium \| Low} |
| Requested By | {stakeholder name / role} |

---

## 2. Business Justification

{Why this migration is needed. What business process or system cutover it supports.}

---

## 3. Source System Description

- **System:** {name and version}
- **Owner:** {team or contact}
- **Connection:** {SFTP / SQL / REST / Dataverse}
- **Authentication:** {SSH key / Service Principal / SQL auth}
- **Format:** {CSV / JSON / XML / SQL table} — encoding: {UTF-8 / UTF-16} — delimiter: {, / | / tab}
- **Available Fields:**

| Field / Column | Type | Sample | Notes |
|---|---|---|---|
| {field} | {type} | {example} | {notes} |

- **Known Data Quality Issues:** {nulls, encoding problems, date format inconsistencies}

---

## 4. Target System Description

- **System:** {name}
- **Owner:** {team or contact}
- **Connection:** {Dataverse / SQL / SFTP}
- **Authentication:** {Service Principal / Managed Identity / SQL auth}
- **Entities / Tables:**

| Entity / Table | Existing Records | Notes |
|---|---|---|
| {entity} | {N} | {greenfield / brownfield} |

---

## 5. Staging Requirements

- **SQL Staging Server:** {server.database.windows.net}
- **SQL Staging Database:** {database name}
- **New Tables Required:** {list or "use existing stg schema"}
- **Staging Data Retention:** {N days}

---

## 6. Data Volume and Frequency

| Entity | Records per Run | File Size | Frequency | Processing Window |
|---|---|---|---|---|
| {entity} | {N} | {MB/GB} | {daily \| hourly} | {HH:MM–HH:MM UTC} |

---

## 7. Field Scope

**Included Fields:** {all fields to be migrated — or "See Section 3"}

**Excluded Fields:**
| Field | Reason |
|---|---|
| {field} | {reason} |

---

## 8. Data Quality Rules

For each entity:

| Rule | Field | Condition | Action on Failure |
|---|---|---|---|
| Required | {field} | Must not be null/empty | Write to error table |
| Format | {field} | Must match {pattern} | Write to error table |
| Lookup | {field} | Must exist in {ref table} | Write to error table |
| Range | {field} | Must be between {min} and {max} | Write to error table |

---

## 9. Error Handling Requirements

- **Acceptable Error Rate:** < {N}% of records per run
- **Action if threshold exceeded:** {Stop pipeline / Continue and alert}
- **Notification:** {Teams webhook URL / email / both}
- **Error file delivery:** {SFTP error folder / email attachment / no return required}

---

## 10. Security and Compliance Requirements

| Field | Classification | Controls Required |
|---|---|---|
| {field} | PII / Sensitive / Internal / Public | {masking / encryption / none} |

- **Data Residency:** {region}
- **PGP Encryption for Outbound:** {Yes / No}
- **Audit Logging:** {Yes — audit.migration_run table}
- **Non-Production Masking:** {Yes — mask {fields} in dev/test}

---

## 11. Non-Functional Requirements

| NFR | Requirement |
|---|---|
| Performance | Process {N} records within {N} minutes |
| Availability | Trigger window: {HH:MM}–{HH:MM} UTC |
| Retry | Max {N} retries before alerting |
| Data Retention | Staging data retained for {N} days |
| RTO | {N} hours |
| RPO | {N} hours |

---

## 12. Dependencies and Pre-conditions

- [ ] Source system accessible from ADF (firewall rule / VPN)
- [ ] Target entity/table exists with all required fields
- [ ] SQL Staging database provisioned
- [ ] Azure Key Vault provisioned
- [ ] ADF instance provisioned
- [ ] Service Principal created with Dataverse permissions
- [ ] SFTP service account credentials available
- [ ] {custom dependency}

---

## 13. Out of Scope

- {item explicitly excluded}
- {item explicitly excluded}
