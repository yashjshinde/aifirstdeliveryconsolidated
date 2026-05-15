---
adr: 0007
title: Brownfield auto-mode with self-healing retry loop and gap log as the single review artefact
status: accepted
decided-on: 2026-05-14
design-doc-refs: [agents/brownfield.md, 11-mcp-server.md]
---

# ADR-0007 — Brownfield auto-mode + self-healing retry loop + gap log

## Status

`accepted` — decided 2026-05-14.

## Context

Brownfield reverse-engineering operates at a different volume than greenfield design: a typical legacy D365 solution has 100+ plugins, 80+ flows, 50+ entities, hundreds of JS files. Per-doc human review at that volume is unworkable — reviewers would either skim everything (defeating the purpose) or block delivery indefinitely.

The other agents (CE / F&O / Integration / Reporting) keep a human gate at the spec level (per ADR-0001). Brownfield needs a different model: machine-enforced quality at generation time, with a structured gap log as the **single artefact a reviewer reads**.

## Decision

Three parts:

### (a) No `/review` command for brownfield

Brownfield is the only agent without a `/review` command. `/generate` is the auto pipeline that runs end-to-end without human approval per artefact.

### (b) Self-healing retry loop per document

Per-scope retry loop with deterministic validators in MCP:

```
generate_doc(scope, artifact):
  doc = run_template(scope, artifact)
  for attempt in 1..3:
    issues = run_validators(doc, scope)        # MCP brownfield_validators/
    if not issues: write(doc); return
    doc = re_attempt_with_focused_prompt(doc, issues)
  log_gap(artifact, residual_issues)            # honest stop; not silent
  write(doc with KNOWN_GAP markers)
```

Validators are **machine code** in `tools/mcp-server/groups/brownfield_validators/`:

| Validator | Detects | Self-heal action |
|---|---|---|
| `validate_no_grouping` | "Other X (~N more)" patterns | Re-prompt to author per-file sections |
| `validate_entity_field_dictionary` | Source attribute count ≠ documented field count | Re-prompt with missing-field list |
| `validate_form_layout` | Form doc missing tab/section/field structure | Re-extract form XML; re-prompt |
| `validate_flow_runbook` | Flow doc missing numbered actions / branches / errors | Re-prompt with flow JSON chunks |
| `validate_plugin_logic` | Plugin doc missing if-then / Dataverse ops / errors | Re-prompt with C# Execute() body |
| `validate_ssrs_sql` | Report doc has paraphrased SQL instead of verbatim `<CommandText>` | Parse RDL; re-prompt with raw SQL |
| `validate_integration_contract` | Integration doc missing request/response/status/auth/retry | Re-prompt with Azure Function code |
| `validate_power_apps_depth` | Canvas / Pages / Custom Pages at inventory level only | Re-extract if source present; else log BLOCKED-BY-BINARY |
| `validate_evidence_chain` | Claims without source reference (file:line or section) | Re-prompt to add citations |
| `validate_inventory_coverage` | Any artifact category absent from inventory | List missing categories; re-prompt to scan |

Hybrid model: **structural validators in MCP** (deterministic gates) + **semantic LLM self-critique** as post-processing improvement. CI test corpus (anonymised D365 solution) at `tools/mcp-server/brownfield_validators/test-corpus/` runs the full pipeline on every change.

### (c) Gap log is the single review artefact

When the loop genuinely can't recover (binary file with no source, missing input, ambiguous evidence after retry exhaustion), the agent logs a **typed gap entry** in `gap-log.json`:

```yaml
- id: <uuid>
  category: BLOCKED-BY-BINARY | MISSING-INPUT | INFERENCE-LOW-CONFIDENCE | EXCEEDED-RETRY-LIMIT | UNSUPPORTED-PATTERN
  artifact: <file or asset>
  reason: <short>
  whatWouldUnblock: <one-line hint>
  severity: blocker | warning | info
```

The reviewer reads `gap-log.json` (or its markdown projection) — not hundreds of generated docs. **Coverage guarantee**: every artefact in inventory is either (a) documented and passes validators, or (b) has a typed entry in `gap-log.json`. No silent omissions.

## Alternatives considered

- **Per-doc human review (same as CE/FO/Int/Rep).** Reject — volume is too high. Reviewers either skim or block.
- **Single-pass generation without validators.** Reject — quality unpredictable; the reference's earlier brownfield iterations confirmed initial docs were poor without machine enforcement.
- **LLM-as-judge for all checks.** Reject — non-deterministic. Structural checks (no-grouping, evidence chain, field-count match) are best enforced by code.

## Consequences

**Positive:**
- Brownfield scales: hundreds of artefacts processed without human review per doc.
- Quality enforcement is deterministic, fast, versioned, and unit-tested.
- Reviewers focus on the gap log — concrete unblockers rather than open-ended doc review.

**Negative:**
- Validators must be authored and maintained alongside templates. Adding a new artifact type requires both a binding (ADR-0008) and possibly a new validator.
- Retry-with-refocused-prompt is non-trivial LLM tooling; needs careful prompt engineering and per-validator focused error messages.
- "No silent skips" guarantee is only as strong as the inventory pass — if scan misses an artifact category entirely, the gap log won't surface it. Mitigated by `validate_inventory_coverage`.

**Affected design docs:** [agents/brownfield.md](../agents/brownfield.md), [11-mcp-server.md](../11-mcp-server.md).

## References

- Related ADRs: [ADR-0008](0008-brownfield-patterns-and-bindings.md) (the artifact taxonomy that the loop processes), [ADR-0001](0001-review-scope-spec-only.md) (other agents' review model that this departs from)
