---
agent: d365-fo
sub-domain: nfr-targets
version: 1.0.0
last-reviewed: 2026-05-14
owner: domain
status: "structure-ported; full verbatim body queued as bk-026"
---

# F&O NFR Targets

> AOS response, batch throughput, entity import rates, availability, error rate targets. PORTED structure per R16; per-project targets driven by `project.config.yaml nfr.*`.

## Default targets

| NFR | Default target | Source |
|---|---|---|
| AOS interactive response (P95) | 2000 ms | `project.config.yaml nfr.responseTimeMsP95` |
| Availability | 99.5% | `project.config.yaml nfr.availability` |
| Error rate | < 0.5% | `project.config.yaml nfr.errorRate` |
| Batch job throughput | (per job; documented in TDD) | TDD §7 per OPR-NNN |
| DMF entity import rate | >= 100 rows/sec (single-thread) | TDD §7 per DEN-NNN |
| OData entity read | < 500 ms P95 for single-record read | TDD §7 per DEN-NNN |
| Service class call (SOAP / JSON) | < 1000 ms P95 | TDD §7 per INT-NNN |

## F&O-specific NFR considerations

### Batch throughput

Per-batch-job target documented in TDD. Pattern: `<n> rows/minute` for the typical record set. Failure path documented (resume / skip / dead-letter).

### Entity import rates

DMF performance scales with: target table indexes, validation overhead, parallel-task count, AOS sizing. Document the assumed sizing in TDD §7.

### Service class throughput

Per-endpoint throughput documented as `<n> req/sec at <m> concurrent clients`. When the customer's actual load exceeds the documented target, scaling is via additional AOS instances + service-group rebalancing.

## Override path

Per-feature NFR overrides go in the spec's §6 NFR section. The override fully replaces the default for that feature.

## Verification

When `unitTestPolicy.performance: required` (project-config), the test plan MUST include a Performance suite measuring against the documented NFR targets.

## Source attribution

Full per-target detail PORTED from predecessor's `11-nfr-targets.md` per R16. Queued as bk-026.
