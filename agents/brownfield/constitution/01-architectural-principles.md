---
agent: brownfield
sub-area: architectural-principles
version: 1.0.0
last-reviewed: 2026-05-15
owner: domain
---

# Architectural Principles — brownfield

> Five load-bearing principles. Each is machine-enforced where possible (validators in [`brownfield_validators/`](../../../tools/mcp-server)).

## Principle 1 — Evidence Over Assumption

Every claim in a generated doc cites a source artefact (file path, line number when applicable, or section reference). No paraphrasing of source text when literal capture is possible.

- Field count claims trace to the source XML / JSON / metadata
- SQL bodies are quoted **verbatim** from `<CommandText>` / `.sql` files — never paraphrased
- Plugin / flow logic descriptions reference the actual file region they describe
- Cross-references are mechanically computed from inventory (see [`brownfield-engine/cross-ref.ts`](../../../tools/mcp-server))

Machine-enforced by `validate_evidence_chain`. Re-attempt prompt asks the agent to add citations on a finding-by-finding basis.

## Principle 2 — Coverage Over Brevity

Every artefact in inventory ends in one of three terminal states (per [ADR-0007](../../../design/adr/0007-brownfield-auto-mode-self-healing.md)):

1. **Documented + validators pass** → row in coverage report
2. **Gap-logged with typed category** → row in gap-log
3. **Module-gate silent-skip** → row in coverage report under `module-skipped`

No artefact is silently absent. `validate_inventory_coverage` enforces this against the scan output.

## Principle 3 — Pattern + Binding Over Bespoke

The 9 patterns (`templates/patterns/*.template.md`) are the **only** doc shapes. Every artifact type uses one, declared via its binding (`templates/bindings/{platform}/*.binding.yaml`). Adding a new artifact type is a ~30-line YAML, not a new template.

Forbidden:
- Authoring a custom Markdown template for a single artifact type
- Branching logic inside a pattern template (per [ADR-0010](../../../design/adr/0010-templates-agent-owned.md) — no conditionals in templates)

Allowed:
- Adding a new pattern when a genuinely new shape family emerges (rare — `bk-011` covers the 9 patterns; new pattern needs an ADR)

## Principle 4 — Silent Skip Is Correct For Uninstalled Modules

Bindings declaring `requires: module:<name>` are skipped when [`module-detection.yaml`](../templates/module-detection.yaml) does not detect the module. This is **not a gap**. Silent skip is the correct behaviour for "Marketing module not installed in this project."

Gap-log entries are reserved for things that should-be-documented but couldn't be.

## Principle 5 — Honest Flagging of Inference

When validators trigger semantic-inference paths (e.g., `validate_power_apps_depth` for a Canvas app where source is unavailable), the doc carries an explicit `KNOWN_GAP:` marker AND a gap-log entry of category `BLOCKED-BY-BINARY` or `INFERENCE-LOW-CONFIDENCE`.

Never:
- Fabricate detail to fill a section
- Drop a section to hide missing detail (violates Principle 2)
- Paraphrase what's actually opaque (violates Principle 1)

## Severity bands for gap entries

| Severity | Meaning |
|---|---|
| **blocker** | A reviewer must address this before downstream agents consume the inventory |
| **warning** | Documentation gap; downstream agents proceed with the entry surfaced |
| **info** | Acknowledgement entry (e.g., module detected but no instances of artifact-X) |

## See also

- [02-documentation-standards.md](02-documentation-standards.md) (No Grouping rule)
- [03-quality-rules.md](03-quality-rules.md) (Zero-tolerance gate)
- [ADR-0007](../../../design/adr/0007-brownfield-auto-mode-self-healing.md)
- [ADR-0008](../../../design/adr/0008-brownfield-patterns-and-bindings.md)
