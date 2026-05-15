<!-- alm-push-review.checklist.md - alm agent. Consumed INLINE by /alm push --dry-run. -->

# /alm push Inline Self-Check

> Consumed by `/alm push --dry-run` (and by `/alm push` itself before any ALM write). BLOCKER findings abort the push (no ALM writes); REQUIRED findings need acceptance notes.

## Categories

### A. Configuration
- [ ] `project.config.yaml alm.tool` set to `ado` or `jira` (REQUIRED)
- [ ] `alm.options.{ado|jira}` populated with org / project / base URL (REQUIRED)
- [ ] ALM credentials available via secure storage (Key Vault / env var); not in repo (BLOCKER if literal secret detected)
- [ ] `alm.hierarchy` matches declared tier count (4 for ADO Epic-Feature-Story-Task; 4 for JIRA Initiative-Epic-Story-Subtask)

### B. Local state integrity
- [ ] `work-items.yaml` validates against [`schemas/work-items.v1.json`](../../schemas/work-items.v1.json) (BLOCKER)
- [ ] Every L4 has a parent L3 (and L3 a parent L2 etc.) — no orphans (BLOCKER)
- [ ] Every L3 has at least one Acceptance Criterion (REQUIRED)
- [ ] L4 estimates within 3-8h target window (WARNING outside this band)
- [ ] No `<TBD>` markers in fields about to be pushed (REQUIRED)

### C. Mapping completeness
- [ ] Every local tier maps to an ALM type per `alm.hierarchy` (BLOCKER)
- [ ] Priority map covers every priority value used locally (REQUIRED)
- [ ] State map covers every state used locally (REQUIRED)
- [ ] Custom fields (LocalUID, SpecFR, ObjectIdPrefix) configured for ADO / JIRA per project (REQUIRED for first-time push; WARNING after)

### D. Round-trip fidelity
- [ ] Every markdown → ALM body conversion verified via `alm_roundtrip_check` (REQUIRED when `--roundtrip-check`)
- [ ] Mermaid blocks: PNG rendered + source preserved as `<pre><code class="mermaid">` (REQUIRED)
- [ ] Frontmatter stripped (no `---...---` block in pushed content) (BLOCKER)
- [ ] Auto-generated TOC stripped (no `<!-- TOC -->` blocks) (REQUIRED)

### E. Conflict handling
- [ ] When `--strategy fail-on-conflict`: no hash mismatches detected (BLOCKER)
- [ ] When `--strategy merge` / `overwrite`: conflicts documented in report (REQUIRED)
- [ ] Recent `traceability.yaml lastPushedAt` < 30 days (WARNING if older — stale lastPushedAt may indicate concurrent off-tool edits)

### F. Test cases (when artifact=tests)
- [ ] Every test case has at least one step (BLOCKER)
- [ ] Every step has both action AND expected result (REQUIRED)
- [ ] Steps XML (ADO) / test-tool fields (JIRA) validates against the adapter's schema (BLOCKER)
- [ ] Test plan exists at the configured root name (`alm.test-plan.rootName`) (REQUIRED — auto-creates if missing)

### G. Attachments
- [ ] All referenced images / PDFs exist at their cited paths (BLOCKER if missing)
- [ ] Attachment file sizes within ALM limits (ADO: 60 MB; JIRA Cloud: 100 MB) (WARNING if larger)

## Severity legend

- **BLOCKER** — aborts the push; no ALM writes
- **REQUIRED** — fix or accept with `accepted-by` + `accepted-reason` in the push-report
- **WARNING** — author judgement; logged for audit
