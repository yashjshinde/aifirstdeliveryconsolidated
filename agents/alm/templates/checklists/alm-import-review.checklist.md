<!-- alm-import-review.checklist.md - alm agent. Consumed INLINE by /alm import --dry-run. -->

# /alm import Inline Self-Check

> Consumed by `/alm import --dry-run` (and by `/alm import` itself before any local mutation). BLOCKER findings abort the import; REQUIRED findings need acceptance notes.

## Categories

### A. Source file
- [ ] `<path>` exists and is readable (BLOCKER if missing)
- [ ] Format detection (`auto`) succeeded OR explicit `--format` provided (BLOCKER if neither)
- [ ] File parses without errors (BLOCKER on parse exception)
- [ ] File size sane (< 100 MB; WARNING above)

### B. Schema validity
- [ ] When format=JSON: file validates against `schemas/work-items.v1.json` (BLOCKER)
- [ ] When format=CSV / XLSX: required columns present per [`constitution/01-alm-mapping.md`](../../constitution/01-alm-mapping.md) (BLOCKER)
- [ ] Column mapping (`--map`) resolves all required fields (BLOCKER if a required field is unmapped)

### C. Mode constraints
- [ ] On `--mode create`: zero incoming rows match existing `localUID` (BLOCKER if violated)
- [ ] On `--mode update`: every incoming row matches an existing `localUID` (BLOCKER if violated)
- [ ] On `--mode upsert` (default): merge conflicts surfaced — incoming wins on declared fields (INFO; report shows each)

### D. Content integrity
- [ ] Every imported step has both action AND expected result (BLOCKER on test imports)
- [ ] Step counts per case match the import (REQUIRED — flag mismatches)
- [ ] No `<TBD>` markers in imported fields (WARNING — caller may have intentionally imported drafts)
- [ ] Special characters escape correctly (CSV: quoted-comma; XLSX: cell newlines; JSON: properly escaped) (BLOCKER on un-decodable content)

### E. Diff scope
- [ ] Diff report shows: NN incoming rows, NN local-only kept, NN to-merge (INFO)
- [ ] Cascade impact on test plan suite organisation surfaced (REQUIRED when re-organising suites)
- [ ] Locked tiers (`work-items.yaml metadata.read-only-levels`) NOT modified by this import (BLOCKER if violated)

### F. Audit
- [ ] Source file path captured in `alm-reports/import-{ts}.md` (REQUIRED — auto)
- [ ] Mapping file path captured (REQUIRED when `--map` used — auto)
- [ ] User intention to push next is implicit; reminder appears in dry-run report (INFO)

## Severity legend

- **BLOCKER** — aborts the import; no local writes
- **REQUIRED** — fix or accept with `accepted-by` + `accepted-reason` in the import-report
- **WARNING** — author judgement; logged for audit
- **INFO** — surfaced for context; no action required
