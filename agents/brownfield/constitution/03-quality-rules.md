---
agent: brownfield
sub-area: quality-rules
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# Quality Rules — Zero-Tolerance Gate (machine-enforced)

> Every doc must pass validators before write. Re-attempt up to N=3 times (per [ADR-0007](../../../design/adr/0007-brownfield-auto-mode-self-healing.md)). On exhaustion: gap-log + write with `KNOWN_GAP:` markers.

## The 10 validators

Implemented in `tools/mcp-server/groups/brownfield_validators/`. Each is deterministic, fast, unit-tested.

| Validator | Detects | Self-heal action | Applies to |
|---|---|---|---|
| `validate_no_grouping` | "Other X (~N more)" phrasings | Re-prompt to author per-file sections | all bindings (global) |
| `validate_entity_field_dictionary` | Source attribute count != documented field count | Re-prompt with missing-field list | `entity`, `table`, `data-entity` |
| `validate_form_layout` | Form doc missing tab/section/field structure | Re-extract form XML; re-prompt | `form` |
| `validate_flow_runbook` | Flow doc missing numbered actions / branches / errors | Re-prompt with flow JSON chunks | `classic-workflow`, `flow`, `business-rule`, `logic-app-*` |
| `validate_plugin_logic` | Plugin doc missing if-then / Dataverse ops / errors | Re-prompt with C# Execute() body | `plugin`, `cwa`, `js-function`, `class` |
| `validate_ssrs_sql` | Report has paraphrased SQL, not verbatim `<CommandText>` | Parse RDL; re-prompt with raw SQL | `ssrs-report`, `pbi-paginated-report` |
| `validate_integration_contract` | Missing request / response / status / auth / retry | Re-prompt with Function code + Logic App def | `function-per-trigger`, `api-connection`, `apim-operation`, `logic-app-consumption` |
| `validate_power_apps_depth` | Canvas / Pages / Custom Pages at inventory level only | Re-extract if source present; else log BLOCKED-BY-BINARY | `canvas-app`, `canvas-component-library`, `custom-page`, `web-page`, `web-template` |
| `validate_evidence_chain` | Claims without source reference | Re-prompt to add citations | all bindings (global) |
| `validate_inventory_coverage` | Any artifact category absent from inventory | List missing categories; re-prompt to scan | scan output (one-shot at `/scan` end) |

## Validator applicability

Two layers per binding:

1. **Global validators** — `validate_no_grouping`, `validate_evidence_chain` — applied to every doc
2. **Per-binding validators** — declared in the binding `validators:` list (typically 1-2 per binding)

Example binding stanza:

```yaml
validators:
  - validate_entity_field_dictionary
  - validate_evidence_chain
```

## Retry loop semantics

```
for attempt in 1..N (default 3, configurable via project.config.yaml brownfield.retry-limit):
  issues = run_validators(doc, scope)
  if not issues:
    write(doc); break
  doc = re_attempt_with_focused_prompt(doc, issues)
else:
  // retries exhausted
  log_gap(artifact, category=EXCEEDED-RETRY-LIMIT, residual_issues)
  write(doc with KNOWN_GAP markers)
```

The focused-prompt strategy is **per-validator**: each validator emits a tailored re-attempt message naming the exact missing/wrong content, not generic "please fix issues."

## Gap log schema

Per [`schemas/brownfield-gap-log.v1.json`](../../../schemas/brownfield-gap-log.v1.json):

```yaml
- id: <uuid>
  category: BLOCKED-BY-BINARY | MISSING-INPUT | INFERENCE-LOW-CONFIDENCE | EXCEEDED-RETRY-LIMIT | UNSUPPORTED-PATTERN
  artifact: <file or asset path>
  reason: <short>
  whatWouldUnblock: <one-line hint>
  severity: blocker | warning | info
  timestamp: <ISO 8601>
  validatorsFailed: [<validator-names>]   # populated for EXCEEDED-RETRY-LIMIT
  artifactType: <type-from-inventory>
  platform: <d365-ce|d365-fo|integration|reporting|power-apps|power-pages|custom-pages>
```

## Coverage report

Written to `docs-generated/coverage-report.md` at the end of `/generate`. Format:

```markdown
# Coverage Report — {project}

## Summary

- Total artefacts in inventory: NN
- Documented (validators passed): NN (XX.X%)
- Gap-logged: NN
- Module-gated (silent-skip): NN

## Per-category

| Category | Total | Documented | Gap-logged | Skipped |
|---|---|---|---|---|
| d365-ce / entity | 47 | 47 | 0 | 0 |
| d365-ce / plugin | 22 | 19 | 3 | 0 |
| d365-ce / sla | 0 | 0 | 0 | 0 (module not detected: customer-service) |
| ... |
```

## CI verification

Anonymised test corpus at `tools/mcp-server/brownfield_validators/test-corpus/`. Every binding has at least one positive case (artifact present + doc passes) and at least one negative case (artifact present + intentional issue → validator fires + doc fails). The CI workflow runs the full pipeline against the corpus.

## See also

- [ADR-0007](../../../design/adr/0007-brownfield-auto-mode-self-healing.md)
- [`schemas/brownfield-gap-log.v1.json`](../../../schemas/brownfield-gap-log.v1.json)
- [`tools/mcp-server/groups/brownfield_validators/`](../../../tools/mcp-server) (implementation queued — see bk-016)
