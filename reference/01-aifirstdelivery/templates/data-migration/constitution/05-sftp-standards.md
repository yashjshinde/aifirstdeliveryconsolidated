# SFTP Standards

## Connection

- SFTP connections use **SSH key authentication** — never password authentication in production.
- Store the private key in Azure Key Vault as a secret: `kv-sftp-{env}-privatekey`.
- Host key verification must be enabled (set `hostKeyFingerprint` in linked service).
- Port: `22` (default). Document any non-standard port.
- Timeout: `60` seconds connect, `300` seconds operation.

---

## File Naming Conventions

### Inbound (SFTP → Dataverse)

Files arriving on SFTP must match the agreed naming pattern defined per migration:

```
{entity}_{source_system}_{YYYYMMDD}[_{HHmmss}][_{batch_seq}].{ext}
```

Examples:
- `accounts_erp_20240315.csv`
- `invoices_legacy_20240315_143022.csv`
- `orders_portal_20240315_001.csv`

The ADF trigger uses a glob pattern to match: `{entity}_*_{batchDate}*.csv`

### Outbound (Dataverse → SFTP)

```
{entity}_{target_system}_{YYYYMMDD}[_{HHmmss}].{ext}
```

Examples:
- `shipments_wms_20240315.csv`
- `payments_bank_20240315_143022.csv`

---

## Folder Structure

### Inbound

```
/incoming/
  {entity}/
    YYYY/MM/DD/
      {filename}          ← new files land here
    archive/
      YYYY/MM/DD/
        {filename}        ← successfully processed files moved here
    error/
      YYYY/MM/DD/
        {filename}        ← files that failed processing
```

### Outbound

```
/outgoing/
  {entity}/
    YYYY/MM/DD/
      {filename}          ← ADF writes here
    delivered/
      YYYY/MM/DD/
        {filename}        ← confirmed-delivered files (partner ACK or manual move)
```

---

## File Format Standards

### CSV

- Encoding: `UTF-8 with BOM` (for compatibility with Excel / legacy systems) or `UTF-8` (default).
- Delimiter: `,` (comma). Document if pipe `|` or tab is required.
- Quote character: `"` (double quote).
- Header row: **required** (first row = column names).
- Line ending: `CRLF` for Windows systems, `LF` for Unix/Linux.
- Null representation: empty field (not `NULL` string).
- Date format: `YYYY-MM-DD` for dates, `YYYY-MM-DDTHH:MM:SS` for datetimes.

### JSON

- Array of objects format (not newline-delimited unless agreed).
- Use camelCase field names.
- Dates as ISO 8601 strings.

### XML

- Use UTF-8 encoding declaration.
- Namespace prefix must be documented in the mapping.

---

## Encryption

For files containing PII or sensitive data:
- **PGP encryption** is required on SFTP-bound outbound files.
- PGP public key stored in Key Vault: `kv-sftp-{partner}-pgp-pubkey`.
- ADF Custom Activity or Azure Function handles PGP encryption/decryption.
- Encrypt after writing to staging area, before pushing to SFTP.
- Document PGP key rotation schedule in `constitution/06-security-standards.md`.

---

## File Size Limits

| Scenario | Limit | Action if exceeded |
|---|---|---|
| Single file ingest | 2 GB | Split into chunks at source |
| Single file export | 500 MB | Split by record count (document threshold) |
| Concurrent files | 10 files | Queue and process serially |

---

## Archiving Policy

1. Successfully processed inbound files → move to `archive/YYYY/MM/DD/` immediately after pipeline success.
2. Failed inbound files → move to `error/YYYY/MM/DD/` — do NOT archive failed files.
3. Outbound files → remain in `outgoing/YYYY/MM/DD/` for 7 days, then auto-deleted by SFTP server policy.
4. Archive retention: 90 days (align with project data retention policy).
