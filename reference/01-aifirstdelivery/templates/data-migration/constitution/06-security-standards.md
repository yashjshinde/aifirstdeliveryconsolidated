# Security Standards

## Principle of Least Privilege

Every service identity must have only the permissions required for its specific migration task.

| Identity | Minimum Permissions |
|---|---|
| ADF Managed Identity | Key Vault Secrets User, Storage Blob Data Contributor (if ADLS), SQL db_datareader + db_datawriter on staging schema |
| Service Principal (Dataverse) | Custom role with Read/Write/Append on specific entities only |
| SFTP Service Account | Read + Write on `/incoming/{entity}/` only; no delete permission |
| SQL Staging Login | `EXECUTE` on `stg` and `err` schema SPs only; no DDL rights |

---

## Azure Key Vault

All secrets must be stored in Key Vault — no exception for production environments.

### Secret Naming Convention

```
kv-{system}-{env}-{purpose}
```

Examples:
- `kv-sftp-prod-privatekey`
- `kv-sql-staging-dev-connstr`
- `kv-dataverse-test-clientsecret`
- `kv-sftp-partner-pgp-pubkey`

### Key Vault Access

- ADF uses **Managed Identity** to access Key Vault (no stored credentials).
- Grant: `Key Vault Secrets User` role on the Key Vault resource.
- Never grant `Key Vault Administrator` to ADF.

### Secret Rotation

- Rotate connection string secrets every 90 days.
- Rotate SSH private keys every 180 days.
- PGP key rotation: align with partner's schedule (minimum annual).
- After rotation: update Key Vault secret, ADF linked service re-reads on next run (no ADF restart needed).

---

## Data Classification

Classify all migrated fields in the field mapping document:

| Classification | Examples | Controls |
|---|---|---|
| **PII** | Name, email, phone, address, DOB | Mask in logs, encrypt in transit, no dev/test copy |
| **Sensitive Business** | Revenue, contract value, pricing | Role-based access, no SFTP without partner agreement |
| **Internal** | Internal codes, status flags | Standard access controls |
| **Public** | Country codes, currency codes | No special controls |

---

## Data Masking

### In Logs

ADF pipeline logs must never contain PII field values.
- Use ADF `secureOutput: true` on activities that process PII fields.
- SQL audit log must store only record counts, not field values.

### In Dev/Test Environments

- Dev/Test SQL staging databases must use masked or synthetic data — never production data copies.
- If a copy of production is required for testing: apply column-level masking using Azure SQL Dynamic Data Masking.
- Document the masking rules in `docs-generated/{migration}/deployment-guide.md`.

---

## Network Security

- ADF Integration Runtime: use **Azure Integration Runtime** for cloud-to-cloud.
- For on-premises SQL or SFTP behind firewall: use **Self-Hosted Integration Runtime** on a dedicated VM.
- No inbound ports opened — SHIR uses outbound-only connections.
- SFTP connections: whitelist ADF IR egress IPs on the SFTP server firewall.
- SQL connections: use Private Endpoint where available; TLS 1.2+ enforced.

---

## Audit Requirements

Every migration run must produce an audit record in `audit.migration_run` with:
- `run_id`, `migration_name`, `direction`, `entity_name`
- `batch_date`, `started_at`, `completed_at`
- `status` (SUCCESS / PARTIAL / FAILED)
- `total_records`, `success_records`, `error_records`
- `source_file` (inbound: SFTP file name; outbound: generated file name)

Audit table must be retained for minimum 12 months.
Access to audit table is read-only for all application identities.

---

## Compliance Checklist

Generated deployment guides must include this checklist:

- [ ] All secrets in Key Vault — no hardcoded credentials
- [ ] ADF Managed Identity used for Key Vault access
- [ ] Service Principal scoped to minimum required entities
- [ ] PII fields marked `secureOutput: true` in ADF activities
- [ ] Dev/Test uses masked data only
- [ ] SFTP private key stored in Key Vault
- [ ] Network rules: SFTP IP whitelisted, SQL Private Endpoint configured
- [ ] Audit log table configured and accessible to monitoring team
- [ ] PGP encryption enabled for PII-containing outbound files
