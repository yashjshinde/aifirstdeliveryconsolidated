---
agent: integration
sub-area: sftp-and-file-handling
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
---

# SFTP and File Handling Standards

## Folder layout per partner

```
sftp://acme/{partner}/
├── inbox/               files dropped by partner; we poll
├── outbox/              files we write; partner picks up
├── archive/{yyyymm}/    after successful processing — copy here
├── error/               files that failed validation — review queue
└── trigger/             zero-byte trigger files for legacy partners
```

## File naming

- Inbound: `{source-system}_{entity}_{yyyymmddTHHmmss}_{seq}.{ext}` (e.g., `acme_customer_20260515T1430_0001.csv`)
- Outbound: `{target-system}_{entity}_{yyyymmddTHHmmss}_{seq}.{ext}`
- `.ready` companion file pattern when atomic landing is required — process only when `.ready` appears

## Polling vs Event-driven

- **Event Grid via Storage** when SFTP is fronted by Azure Blob (via SFTP-on-Blob feature) — react instantly
- **Logic App / Function timer trigger** when SFTP is a true SFTP server — poll every 1-5 min
- Never poll faster than 30 s — coordinate with partner SLA

## Idempotent processing

- Maintain a `dbo.FileProcessingState` table keyed on `FileName + Size + ModifiedAt`
- Insert with `INSERT ... IF NOT EXISTS` semantics before processing — guarantees one-time effect
- Move to `archive/{yyyymm}/` only AFTER the destination commit succeeds

## Error handling

- Files failing schema validation → `error/` + alert
- Files exceeding size threshold → claim-check pattern (drop reference in Service Bus, process via ADF / Function)
- Files with mixed valid + invalid rows → split: write reject rows to `error/{filename}.rejects.csv`, process the rest

## Encoding and CSV conventions

- UTF-8 with BOM forbidden — UTF-8 no-BOM (or partner-mandated encoding declared in the FDD)
- Line endings `\n` (LF) for new partners; CRLF allowed only for legacy mainframe partners
- CSV quoting: RFC 4180 (double-quotes around fields containing comma / newline / quote)
- Header row required for all new feeds; legacy files may use positional formats with explicit field-position docs in the integration TDD

## Security

- SFTP credentials in Key Vault; rotated annually or on partner request
- SFTP key auth preferred over password; passwords stored in Key Vault secret of type `password`
- Private endpoint for SFTP-on-Blob; no public network traversal

## See also

- [02-batch-patterns.md](02-batch-patterns.md)
- [07-adf-standards.md](07-adf-standards.md)
