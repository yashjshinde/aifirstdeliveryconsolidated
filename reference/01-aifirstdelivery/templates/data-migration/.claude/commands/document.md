Generate operational documentation after implementation is complete.

## Usage

```
/document {migration-id}
```

## Pre-condition

`/implement {migration-id}` must be complete (all task cards marked IMPLEMENTED).

## Steps

1. Read ALL files in `constitution/`.
2. Read spec, TDD, blueprint, field mapping, and pipeline design.
3. Generate the three operational documents.

---

## Document 1 — Deployment Guide

**Output:** `docs-generated/{migration-id}/deployment-guide.md`

### Structure

```markdown
# Deployment Guide — {migration-id}

**Version:** 1.0
**Date:** {today}
**Status:** DRAFT → FINAL (after ops review)

## 1. Pre-Deployment Checklist

- [ ] Azure subscription access confirmed
- [ ] Resource Group `{rg}` exists
- [ ] Azure Data Factory `{adf-name}` provisioned
- [ ] Azure SQL Database `{sql-db}` provisioned
- [ ] Key Vault `{kv-name}` provisioned with secrets (see Section 3)
- [ ] Service Principal created with required Dataverse permissions
- [ ] SFTP service account credentials available
- [ ] ADF Managed Identity granted Key Vault Secrets User role

## 2. Key Vault Secrets Setup

| Secret Name | Value Description | Who Sets This |
|---|---|---|
| `kv-sftp-{env}-privatekey` | SFTP SSH private key (PEM format) | Ops / Infrastructure |
| `kv-sql-staging-{env}-connstr` | SQL connection string | Ops / DBA |
| `kv-dataverse-{env}-clientsecret` | Service Principal client secret | Ops / Security |

## 3. SQL Deployment

Run the deployment script against the staging database:
\`\`\`
sqlcmd -S {server} -d {database} -i output/{migration-id}/sql/deploy.sql
\`\`\`

Verify:
- [ ] All schemas created
- [ ] All tables created
- [ ] All stored procedures created

## 4. ADF Deployment

\`\`\`powershell
cd output/{migration-id}/adf/
./deploy.ps1 -Environment {env} -ResourceGroup {rg} -FactoryName {adf-name}
\`\`\`

Verify in ADF Studio:
- [ ] All linked services show green (Test Connection passes)
- [ ] All datasets listed
- [ ] All data flows compiled
- [ ] All pipelines listed
- [ ] Triggers are in Stopped state (enable manually after smoke test)

## 5. Smoke Test

1. Upload `output/{migration-id}/tests/data/{entity}_test_happy_{date}.csv` to `{sftp-incoming-path}`.
2. Manually trigger `PL_ORCH_{Entity}` with `batchDate = {today}`.
3. Verify:
   - [ ] Pipeline run status = Succeeded
   - [ ] `stg.{entity}_stage` has expected record count
   - [ ] `audit.migration_run` has SUCCESS record
   - [ ] Source file moved to archive folder
   - [ ] Dataverse entity has expected records

## 6. Enable Triggers

After smoke test passes:
\`\`\`
az datafactory trigger start --resource-group {rg} --factory-name {adf-name} --name TR_{Entity}_Schedule_Daily
\`\`\`

## 7. Rollback

If deployment fails:
1. Stop all triggers.
2. Delete ADF artefacts: run `az datafactory pipeline delete` for each pipeline.
3. Drop SQL staging tables and SPs.
4. Restore previous ARM template if rolling back a change (not initial deployment).

## 8. Security Compliance Sign-Off

Reference `constitution/06-security-standards.md` compliance checklist:
- [ ] All items checked
```

---

## Document 2 — Runbook

**Output:** `docs-generated/{migration-id}/runbook.md`

### Structure

```markdown
# Runbook — {migration-id}

**Version:** 1.0
**Date:** {today}
**Status:** DRAFT → FINAL

## 1. Schedule

| Environment | Schedule | Window | Owner |
|---|---|---|---|
| Dev | Manual | Any | Developer |
| Test | Manual | Any | QA |
| Prod | Daily {cron} | {HH:MM}–{HH:MM} UTC | Ops |

## 2. Normal Run — Expected Behaviour

1. Source file arrives in `{sftp-path}` matching pattern `{pattern}`.
2. Trigger `TR_{Entity}_*` fires and starts `PL_ORCH_{Entity}`.
3. Pipeline run completes in < {duration}.
4. `audit.migration_run` shows `status = 'SUCCESS'`.
5. Source file moved to `archive/YYYY/MM/DD/`.

## 3. Monitoring

**ADF Monitor:** {adf-monitor-url}
**Log Analytics:** {workspace-url} (if configured)
**Alert Channel:** {Teams channel / email group}

Query to check today's runs:
\`\`\`sql
SELECT * FROM audit.migration_run
WHERE batch_date = CAST(GETUTCDATE() AS DATE)
ORDER BY started_at DESC;
\`\`\`

## 4. Incident Response

### Pipeline Failed

1. Check ADF Monitor for error details.
2. Query error table: `SELECT * FROM err.{entity} WHERE batch_date = '{date}' ORDER BY created_at DESC`.
3. If CONN/AUTH error: check Key Vault secret validity; check SFTP connectivity.
4. If VAL error: triage error table records; correct source data or load manually.
5. Re-run pipeline after fix.

### Missing File Alert

1. Check SFTP `incoming/{entity}/` folder.
2. Contact source system owner.
3. If file delayed: wait for next scheduled run or trigger manually once file arrives.
4. If file permanently missing: log in audit table as `status = 'SKIPPED'` with note.

### Error Rate Exceeds Threshold

1. Do NOT re-run automatically.
2. Query error table for sample of failures.
3. Determine if data quality issue at source or mapping defect.
4. For mapping defect: raise bug in ADO, fix data flow, redeploy, re-run.
5. For source data issue: return error file to source owner for correction.

## 5. Manual Re-run

\`\`\`powershell
az datafactory pipeline create-run \
  --resource-group {rg} \
  --factory-name {adf-name} \
  --name PL_ORCH_{Entity} \
  --parameters '{"batchDate":"{YYYY-MM-DD}","sourceFileName":"{filename}"}'
\`\`\`

## 6. Error Table Triage Query

\`\`\`sql
SELECT
    error_code,
    error_message,
    COUNT(*) AS occurrences,
    MIN(source_row_num) AS first_row
FROM err.{entity}
WHERE batch_date = '{date}'
GROUP BY error_code, error_message
ORDER BY occurrences DESC;
\`\`\`
```

---

## Document 3 — Release Notes

**Output:** `docs-generated/{migration-id}/release-notes.md`

### Structure

```markdown
# Release Notes — {migration-id}

**Version:** 1.0
**Release Date:** {today}
**Status:** DRAFT

## What's New

- End-to-end {direction} migration for {entity}
- ADF pipeline: {N} pipelines, {N} data flows
- SQL Staging: {N} tables, {N} stored procedures
- Test coverage: {N} test cases (SIT + UAT + SEC)

## Infrastructure Deployed

| Resource | Name | Purpose |
|---|---|---|
| ADF Linked Service | {name} | {purpose} |
...

## Known Issues

| Issue | Impact | Workaround |
|---|---|---|
| {issue} | {impact} | {workaround} |

## Next Steps

- [ ] Enable production triggers
- [ ] Hand over runbook to operations team
- [ ] Schedule post-go-live review (2 weeks after first production run)
```

---

## Output

Print:

```
DOCUMENTATION COMPLETE — {migration-id}
════════════════════════════════════════
deployment-guide.md  : docs-generated/{migration-id}/deployment-guide.md
runbook.md           : docs-generated/{migration-id}/runbook.md
release-notes.md     : docs-generated/{migration-id}/release-notes.md

Migration {migration-id} is READY FOR DELIVERY.
```
